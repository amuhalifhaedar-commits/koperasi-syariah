const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const pool = mysql.createPool({
    ...(typeof dbConfig === 'string' ? { uri: dbConfig } : dbConfig),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
