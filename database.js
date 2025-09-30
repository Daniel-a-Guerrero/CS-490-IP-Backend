// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();


// Create a connection pool for better performance and reliability
const pool = mysql.createPool({
  user: process.env.user, // Replace with your MySQL username
  password: process.env.password, // Replace with your MySQL password
  host:process.env.host,
  port:process.env.port,
  database: process.env.database, // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to execute SQL queries
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { query };