const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect route (require login)
router.get('/', authMiddleware, settingsController.getSettings);
router.put('/', authMiddleware, settingsController.updateSettings);

module.exports = router;
