const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
if (!fs.existsSync('./data')){
    fs.mkdirSync('./data');
}
const db = new sqlite3.Database('./data/expenses.db');


db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Transactions Table (Used for both Budget additions and Expenses)
  // type will be either 'budget' or 'expense'
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    description TEXT,
    amount REAL,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;