import * as dotenv from "dotenv";

dotenv.config({path: ".env.test"});

console.log("⚡ Tests d'intégration - DATABASE_URL =", process.env.DATABASE_URL);
