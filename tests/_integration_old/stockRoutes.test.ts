import request from "supertest";
// import { app } from "../../src";
import { HTTP_CODE_OK } from "@utils/httpCodes";
import { initializeApp } from "@core/initializeApp";

describe("Stock Routes", () => {
  it("should run a test", async () => {
    expect(true).toBe(true);
  });
});

// describe("Stock Routes", () => {
//
//
//     beforeAll(async () => {
//         await initializeApp();
//     });
//
//     it("should handle GET /stocks route", async () => {
//         const response = await request(app).get("/api/v1/stocks");
//         const result = response.body[0];
//
//         expect(response.status).toBe(HTTP_CODE_OK);
//         expect(response.body).toBeDefined();
//         expect(Array.isArray(response.body)).toBe(true);
//
//         if (response.body.length > 0) {
//             expect(result).toHaveProperty('description');
//             expect(result).toHaveProperty('id');
//             expect(result).toHaveProperty('label');
//         }
//     });
// });

// describe('Stock Routes', () => {
//     it('should handle GET /stocks route', async () => {});
// });
