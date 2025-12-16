import {Response} from "express";
import {
    HTTP_CODE_BAD_REQUEST,
    HTTP_CODE_CONFLICT,
    HTTP_CODE_INTERNAL_SERVER_ERROR,
    HTTP_CODE_NOT_FOUND
} from "@utils/httpCodes";

export interface CustomError extends Error {
    typology?: ErrorMessages;
    status?: number;
}

export class ValidationError extends Error implements CustomError {
    constructor(message: string, public typology: ErrorMessages, public data?: any) {
        super(message);
        this.name = 'ValidationError';
    }
}


export class DatabaseError extends Error implements CustomError {
    constructor(message: string, public typology: ErrorMessages, public originalError?: any) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class NotFoundError extends Error implements CustomError {
    constructor(message: string, public typology: ErrorMessages) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error implements CustomError {
    constructor(message: string, public typology: ErrorMessages) {
        super(message);
        this.name = 'BadRequestError';
    }
}

export class ConflictError extends Error implements CustomError {
    constructor(message: string, public typology: ErrorMessages) {
        super(message);
        this.name = 'ConflictError';
    }
}

export enum ErrorMessages {
    ValidationError = "Validation error occurred:",
    UpdateStockItemQuantity = "Error while updating the stock item quantity:",
    AddStockItem = "Error while adding a new stock item:",
    DeleteStockItem = "Error while deleting the stock item from the database:",
    DeleteStock = "Error while deleting the stock from the database:",
    GetAllStocks = "Error while retrieving all stocks:",
    CreateStock = "Error while creating a new stock:",
    GetStockDetails = "Error while retrieving the stock details:",
    GetStockItems = "Error while retrieving the items of the stock:",
    GetItemDetails = "Error while retrieving the item details:",
    GetAllItems = "Error while retrieving all items:",
    ConvertOIDtoUserID = "Error while converting OID to UserID",
    AddUser = "Error while adding user to DB",
}

export const sendError = (res: Response, err: CustomError) => {

    switch (true) {
        case err instanceof ValidationError:
            return res.status(HTTP_CODE_BAD_REQUEST).json({error: err.message, type: err.typology, details: err});

        case err instanceof BadRequestError:
            return res.status(HTTP_CODE_BAD_REQUEST).json({error: err.message, type: err.typology});

        case err instanceof NotFoundError:
            return res.status(HTTP_CODE_NOT_FOUND).json({error: err.message, type: err.typology});

        case err instanceof ConflictError:
            return res.status(HTTP_CODE_CONFLICT).json({error: err.message, type: err.typology});

        case err instanceof DatabaseError:
            const databaseError = err as DatabaseError;
            console.error("Original database error:", databaseError.originalError);
            return res.status(HTTP_CODE_INTERNAL_SERVER_ERROR).json({
                error: "A database error occurred. Please try again later.",
                type: err.typology
            });

        default:
            return res.status(HTTP_CODE_INTERNAL_SERVER_ERROR).json({error: "An unexpected error occurred. Please try again later."});
    }
};


