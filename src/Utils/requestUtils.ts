import { Request } from 'express';
import {Stock, StockToCreate} from "@core/models";


export const extractDataFromRequestBody = (req: Request, keys: string[]) => {
    const data: Partial<StockToCreate> = {};
    keys.forEach(key => {
        data[key as keyof StockToCreate] = req.body[key];
    });
    return data;
};