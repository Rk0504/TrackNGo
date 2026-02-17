const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Secret for JWT (Should be in .env but hardcoded for dev simplicity now)
const JWT_SECRET = process.env.JWT_SECRET || 'trackngo-super-secret-key';

// Register User
exports.register = async (req, res) => {
    console.log('[AUTH] Register request received');
    console.log('[AUTH] Request body:', req.body);

    const { name, dob, mobile_number } = req.body;

    if (!name || !dob || !mobile_number) {
        console.log('[AUTH] Missing required fields');
        return res.status(400).json({ error: 'Name, DOB, and Mobile Number are required' });
    }

    try {
        // No password required, using dummy value to satisfy DB constraint
        const hashedPassword = "NO_PASSWORD";
        const createdAt = new Date().toISOString();

        const sql = `INSERT INTO users (name, dob, mobile_number, password, created_at) VALUES (?, ?, ?, ?, ?)`;

        db.run(sql, [name, dob, mobile_number, hashedPassword, createdAt], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Mobile number already registered' });
                }
                console.error("DB Error:", err);
                return res.status(500).json({ error: 'Database error during registration' });
            }

            const token = jwt.sign({ id: this.lastID, mobile: mobile_number }, JWT_SECRET, { expiresIn: '365d' }); // Long expiry

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: this.lastID, name, mobile_number }
            });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login User
exports.login = (req, res) => {
    const { mobile_number } = req.body;

    if (!mobile_number) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    const sql = `SELECT * FROM users WHERE mobile_number = ?`;

    db.get(sql, [mobile_number], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Mobile number not found. Please register first.' });

        // Password check REMOVED

        const token = jwt.sign({ id: user.id, mobile: user.mobile_number }, JWT_SECRET, { expiresIn: '365d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, mobile_number: user.mobile_number }
        });
    });
};
