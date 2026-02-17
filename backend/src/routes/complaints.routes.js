const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const complaints = require('../controllers/complaints.controller');

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'evidence-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Media types only: image/*, video/*
    // Exact user requirement: 'jpeg', 'png', 'mp4', 'webm'
    const allowed = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid media type. Only JPEG, PNG, MP4, WEBM allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit (max for video)
    }
});

// --- Routes ---
router.post('/', upload.single('media_file'), complaints.createComplaint);
router.get('/', complaints.getAllComplaints);
router.get('/user/:userId', complaints.getUserComplaints); // Get all complaints for a user
router.get('/:complaintId', complaints.getComplaintById); // Get specific complaint details

module.exports = router;
