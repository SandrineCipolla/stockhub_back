//Etablir la connexion à la base de données MySQL

import mysql, { PoolConnection } from 'mysql2/promise';
import { connectionOptions } from './configurationDb';
import { rootUtils } from '@utils/logger';

const pool = mysql.createPool(connectionOptions);

export async function connectToDatabase(): Promise<PoolConnection> {
  try {
    const connection = await pool.getConnection();
    rootUtils.info('Connection to database retrieved from pool');
    return connection;
  } catch (error) {
    rootUtils.error('Unable to retrieve connection form pool:', error);
    throw error;
  }
}
