import * as dotenv from "dotenv";

dotenv.config({path: ".env.test"});

console.log("⚡ Integration tests - DATABASE_URL =", process.env.DATABASE_URL);
