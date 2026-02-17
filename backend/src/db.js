const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, '../data/complaints.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    // Create Complaints Table
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        bus_number TEXT,
        description TEXT,
        media_path TEXT NOT NULL,
        media_type TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        captured_at TEXT,
        created_at TEXT,
        status TEXT DEFAULT 'Pending'
    )`, (err) => {
        if (err) {
            console.error('Error creating complaints table:', err.message);
        } else {
            console.log('Validated complaints table schema');
            // Migration: Add user_id column if it doesn't exist (for existing DB)
            db.run(`ALTER TABLE complaints ADD COLUMN user_id INTEGER`, (err) => {
                // Ignore error if column already exists
            });
        }
    });

    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dob TEXT NOT NULL,
        mobile_number TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT,
        language TEXT DEFAULT 'en',
        notifications INTEGER DEFAULT 1
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Validated users table schema');
            // Migration: Add columns if they don't exist
            db.run(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'`, (err) => { });
            db.run(`ALTER TABLE users ADD COLUMN notifications INTEGER DEFAULT 1`, (err) => { });
        }
    });
});

module.exports = db;
