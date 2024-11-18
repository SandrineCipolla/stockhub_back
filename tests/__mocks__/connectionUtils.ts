import {jest} from "@jest/globals";

import {Request, Response} from "express";
import {PoolConnection} from "mysql2/promise";

// Mock pour la requête
export function createMockedRequest(): Request {
    return {} as Request;
}

//Mock pour la Fausse Connection à la db
export function createFakeDatabaseConnection(): PoolConnection {
    return {query: jest.fn()} as unknown as PoolConnection;
}

// Mock de la connexion à la base de données (objet qui simule une connexion)
export const mockConnection = {
    query: jest.fn(),
};

export interface MockedResponse extends Response {
    getStatusCode: () => number;
}

export function createMockedResponse(): MockedResponse {
    let statusCode = 200;
    const mockedResponse: Partial<MockedResponse> = {
        status: ((code: number) => {
            statusCode = code;
            return mockedResponse as MockedResponse;
        }) as (code: number) => MockedResponse,
        json: jest.fn() as (body: any) => MockedResponse,
        getStatusCode: () => statusCode,
    };
    return mockedResponse as MockedResponse;
}