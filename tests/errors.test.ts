import {
  BadRequestError,
  ConflictError,
  DatabaseError,
  ErrorMessages,
  NotFoundError,
  sendError,
  ValidationError,
} from '@core/errors';
import {
  HTTP_CODE_BAD_REQUEST,
  HTTP_CODE_CONFLICT,
  HTTP_CODE_INTERNAL_SERVER_ERROR,
  HTTP_CODE_NOT_FOUND,
} from '@utils/httpCodes';
import spyOn = jest.spyOn;

describe('sendError', () => {
  let res: any;

  beforeAll(() => {
    spyOn(console, 'error').mockImplementation();
  });

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 400 for ValidationError', () => {
    const err = new ValidationError('Validation failed', ErrorMessages.ValidationError);
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({ error: err.message, type: err.typology, details: err });
  });

  it('should return 400 for BadRequestError', () => {
    const err = new BadRequestError('Bad request', ErrorMessages.UpdateStockItemQuantity);
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({ error: err.message, type: err.typology });
  });

  it('should return 404 for NotFoundError', () => {
    const err = new NotFoundError('Not found', ErrorMessages.GetAllStocks);
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({ error: err.message, type: err.typology });
  });

  it('should return 409 for ConflictError', () => {
    const err = new ConflictError('Conflict occurred', ErrorMessages.AddStockItem);
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_CONFLICT);
    expect(res.json).toHaveBeenCalledWith({ error: err.message, type: err.typology });
  });

  it('should return 500 for DatabaseError', () => {
    const err = new DatabaseError(
      'Database error',
      ErrorMessages.DeleteStockItem,
      new Error('Original DB error')
    );
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: 'A database error occurred. Please try again later.',
      type: err.typology,
    });
  });

  it('should return 500 for unknown errors', () => {
    const err = new Error('Unknown error');
    sendError(res, err);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE_INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred. Please try again later.',
    });
  });
});
