import {Request, Response} from 'express';

/**
 * Factory pour créer des mocks de Request Express pour les tests
 * Évite l'utilisation de `as` et fournit des objets partiels type-safe
 */

export function createMockRequest(overrides?: Partial<Request>): Request {
    const mockRequest: Partial<Request> = {
        params: {},
        query: {},
        body: {},
        headers: {},
        get: jest.fn(),
        header: jest.fn(),
        ...overrides
    };

    return mockRequest as Request;
}

export function createMockResponse(): jest.Mocked<Response> {
    const mockResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        sendStatus: jest.fn().mockReturnThis()
    };

    return mockResponse as jest.Mocked<Response>;
}

/**
 * Crée un UserIdentifier mock pour les tests
 */
export function createMockUserIdentifier(value: number = 42) {
    return {
        empty: false,
        value
    };
}
