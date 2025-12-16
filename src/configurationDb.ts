//Config database

import {rootDatabase} from "@utils/logger";

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307;
const dbDatabase = process.env.DB_DATABASE;
const dbConnectionLimit = process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 3;
const dbMaxIdle = process.env.DB_MAX_IDLE ? parseInt(process.env.DB_MAX_IDLE, 10) : 3;

rootDatabase.info(
    "Database configuration {host}, {user}, {port}, {database}",
    dbHost,
    dbUser,
    dbPort,
    dbDatabase
);

export const connectionOptions = {
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    database: dbDatabase,
    connectionLimit: dbConnectionLimit,
    maxIdle: dbMaxIdle
};
