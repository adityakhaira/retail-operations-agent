const Database = require("better-sqlite3");
const path = require("path");

const databasePath =
    path.join(__dirname, "retail.db");

const db =
    new Database(databasePath);

db.pragma("journal_mode = WAL");

module.exports = db;