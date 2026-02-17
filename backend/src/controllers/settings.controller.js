const db = require('../db');

// Get User Settings
exports.getSettings = (req, res) => {
    // If user is authenticated, use their ID
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;

    db.get('SELECT language, notifications FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('DB Error getting settings:', err);
            return res.status(500).json({ error: 'Failed to fetch settings' });
        }

        if (!row) {
            // Default if user not found (unlikely if authenticated)
            return res.json({ language: 'en', notifications: true });
        }

        res.json({
            language: row.language || 'en',
            notifications: !!row.notifications // Convert 1/0 to true/false
        });
    });
};

// Update User Settings
exports.updateSettings = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const { language, notifications } = req.body;

    // Validate inputs (Basic)
    const validLanguages = ['en', 'ta']; // English, Tamil
    const langToSave = validLanguages.includes(language) ? language : 'en';
    const notifToSave = notifications ? 1 : 0; // Boolean to Integer

    const sql = `UPDATE users SET language = ?, notifications = ? WHERE id = ?`;

    db.run(sql, [langToSave, notifToSave, userId], function (err) {
        if (err) {
            console.error('DB Error updating settings:', err);
            return res.status(500).json({ error: 'Failed to update settings' });
        }

        res.json({
            message: 'Settings updated successfully',
            settings: {
                language: langToSave,
                notifications: !!notifToSave
            }
        });
    });
};
