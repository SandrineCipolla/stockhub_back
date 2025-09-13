import {RowDataPacket} from "mysql2/promise";
import {WriteStockRepository} from "./repositories/writeStockRepository";

export interface CustomRowDataPacket extends RowDataPacket {
    ID: number;
    LABEL: string;
    DESCRIPTION: string;
    QUANTITY: number;
}

export class Stock  {
    id: number;
    label: string;
    description: string;
    quantity: number;

    constructor(id: number, label: string, description: string, quantity: number) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.quantity = quantity;
    }

}

export interface StockToCreate {
    LABEL: string;
    DESCRIPTION: string;
}

export class UpdateStockRequest {
    itemID: number;
    quantity: number;
    stockID: number;

    constructor(itemID: number, quantity: number, stockID: number) {
        this.itemID = itemID;
        this.quantity = quantity;
        this.stockID = stockID;
    }
}

export class Item {
    id :number;
    label: string;
    description: string;
    quantity: number;
    stock_id: number;

    constructor(id: number, label: string, description: string, quantity: number,stock_id:number) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.quantity = quantity;
        this.stock_id= stock_id;
    }
}

// ============================================================


// Initialement dans src/contexts/stock-management/create-stock/models, si réutiliser, à bouger ailleurs
//value-object
// export class StringValidator {
//     source: string;
//
//     constructor(source: string) {
//         this.source = source;
//     }
//
//     public isValid() : boolean {
//         return this.source.length > 0 && this.source.length <= 255;
//     }
// }
//
// export class UserIdentifier {
//     id: number;
//
//     constructor(id: number) {
//         this.id = id;
//     }
// }
//
// // Dans src/contexts/stock-management/create-stock/models
// //interface pour accéder au repo
// export interface IAllStocks {
//     add(stock: StockToCreate2): StockIdentifier;
// }
//
// //entité
// export class StockToCreate2 {
//     private label: StringValidator;
//     private description: StringValidator;
//     private userId: UserIdentifier;
//     private allStocks:IAllStocks;
//     constructor(label: string, description: string, userId: number, allStocks : IAllStocks) {
//         this.label = new StringValidator(label);
//         this.description = new StringValidator(description);
//         this.userId = new UserIdentifier(userId);
//         this.allStocks = allStocks;
//     }
//
//     private isValid(): boolean {
//         return this.label.isValid() && this.description.isValid();
//     }
//
//     public create(): StockIdentifier {
//         if(this.isValid()) {
//             return this.allStocks.add(this);
//         }
//         throw new InvalidStockException("Invalid stock data");
//     }
// }
//
// // Dans src/contexts/stock-management/create-stock/repositories
//
// export class AllStocks implements IAllStocks {
//     private writeRepo: WriteStockRepository;
//
//     public constructor(writeRepo: WriteStockRepository) {
//      this.writeRepo = writeRepo;
//     }
//
//     public add(stock: StockToCreate2): StockIdentifier {
//         // le code ici
//
//     }
// }
//
// // Dans src/contexts/stock-management/create-stock/services
// export class StockCreationService {
//     public createStock(label: string, description: string, userId: number, allStocks : IAllStocks): StockIdentifier {
//
//         // TODO init StockToCreate2
//
//     // TODO appeler    create
//     }
// }