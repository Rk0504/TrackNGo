const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'trackngo-super-secret-key';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // If not authenticated, act as a Guest if guestMode is enabled (optional)
        // But for protected routes, return 401
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        console.error('Invalid token:', err.message);
        res.status(403).json({ error: 'Invalid token.' });
    }
};
