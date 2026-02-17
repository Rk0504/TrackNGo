const fs = require('fs');
const path = require('path');
const db = require('../db'); // Import DB connection

// Helper function to generate unique complaint ID
const generateComplaintId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `TN-${timestamp}-${randomStr}`.toUpperCase();
};

exports.createComplaint = (req, res) => {
    let { bus_number, description, media_type, latitude, longitude, captured_at, address, user_id } = req.body;
    const file = req.file;

    // Use default values if fields are missing
    bus_number = bus_number || 'Unknown';
    description = description || '';
    address = address || 'Unknown Location';
    user_id = user_id || null; // Optional if not logged in

    // Basic Validation
    if (!media_type || !latitude || !longitude || !captured_at || !file) {
        if (file) {
            fs.unlink(file.path, (err) => { if (err) console.error(err); });
        }
        return res.status(400).json({ error: 'Missing required fields (media or location)' });
    }

    const complaintId = generateComplaintId();
    // Path relative to where the frontend will serve it
    const mediaPath = file.filename;

    // Insert into Database
    const sql = `
        INSERT INTO complaints (complaint_id, user_id, bus_number, description, media_path, media_type, latitude, longitude, address, captured_at, created_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        complaintId,
        user_id,
        bus_number,
        description,
        mediaPath,
        media_type,
        parseFloat(latitude),
        parseFloat(longitude),
        address,
        captured_at,
        new Date().toISOString(),
        'Pending'
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: 'Failed to save complaint to database' });
        }

        console.log(`[DB] New complaint created: ${complaintId} (ID: ${this.lastID})`);

        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint_id: complaintId,
            status: 'Pending'
        });
    });
};

// Get all complaints for a specific user
exports.getUserComplaints = (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = `
        SELECT id, complaint_id, bus_number, description, media_type, address, status, created_at 
        FROM complaints 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `;

    db.all(sql, [userId], (err, complaints) => {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }

        res.json({
            success: true,
            count: complaints.length,
            complaints: complaints
        });
    });
};

// Get detailed information for a specific complaint
exports.getComplaintById = (req, res) => {
    const complaintId = req.params.complaintId;

    if (!complaintId) {
        return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const sql = `
        SELECT * FROM complaints WHERE complaint_id = ?
    `;

    db.get(sql, [complaintId], (err, complaint) => {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch complaint details' });
        }

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json({
            success: true,
            complaint: complaint
        });
    });
};

// New: Fetch all complaints for Admin view
exports.getAllComplaints = (req, res) => {
    const sql = `SELECT * FROM complaints ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            data: rows
        });
    });
};
