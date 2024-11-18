//Etablir la connexion à la base de données MySQL

import mysql, { PoolConnection } from "mysql2/promise";
import { connectionOptions } from "./configurationDb";
import { rootUtils } from "./Utils/logger";

const pool = mysql.createPool(connectionOptions);

export async function connectToDatabase(): Promise<PoolConnection> {
  try {
    const connection = await pool.getConnection();
    rootUtils.info("Connection to database successful");
    return connection;
  } catch (error) {
    //TODO :affiner les message d'erreur.
    rootUtils.error("Error connecting to the database:", error);
    throw error;
  }
}
