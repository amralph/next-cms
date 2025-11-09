import mysql, { Pool } from 'mysql2/promise';

// Extend the global object to include our cached pool
declare global {
  var mysqlPool: Pool | undefined;
}

if (!global.mysqlPool) {
  global.mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false, // Ignore self-signed certificates
    },
  });
}

const pool = global.mysqlPool;

export default pool;
