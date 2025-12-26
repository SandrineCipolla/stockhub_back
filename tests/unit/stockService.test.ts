import { StockService } from '@services/stockService';
import {
  fakeStocks,
  fakeStocksAsRowDataPacket,
  mockReadRepo,
  mockWriteRepo,
} from '../__mocks__/mockedData';
import { ReadStockRepository } from '@repositories/readStockRepository';
import { WriteStockRepository } from '@repositories/writeStockRepository';

// mock pour ReadStockRepository et WriteStockRepository
jest.mock('@repositories/readStockRepository');
jest.mock('@repositories/writeStockRepository');

// Configuration du test
describe('StockService', () => {
  let stockService: StockService;
  let mockedReadRepo: jest.Mocked<ReadStockRepository>;
  let mockedWriteRepo: jest.Mocked<WriteStockRepository>;

  beforeEach(() => {
    mockedReadRepo = mockReadRepo;
    mockedWriteRepo = mockWriteRepo;
    stockService = new StockService(mockedReadRepo, mockedWriteRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return stocks with id and label columns', async () => {
      jest.spyOn(mockedReadRepo, 'readAllStocks').mockResolvedValue(fakeStocksAsRowDataPacket);
      const userID = 1;
      const stocks = await stockService.getAllStocks(userID);
      expect(stocks).toEqual(fakeStocks);
    });
  });
});

// describe("insertStock", () => {
//     it("should insert a new entry into the stock table and return updated table", async () => {
//         // Mock initial state
//         (readRepo.readAllStocks as jest.Mock).mockResolvedValueOnce(fakeStocks);
//
//         // Simulate insertion
//         await stockService.createStock(newStocks);
//
//         // Mock the table state after insertion
//         (readRepo.readAllStocks as jest.Mock).mockResolvedValueOnce([...fakeStocks, ...newStocks]);
//
//         // Check final state of the table
//         const finalStocks = await readRepo.readAllStocks();
//         expect(finalStocks).toEqual(expect.arrayContaining(newStocks));
//
//         // Verify the insertion query was called with correct parameters
//         expect(writeRepo.createStock).toHaveBeenCalledWith(newStocks);
//     });
// });
