const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import route handlers
const gpsRoutes = require('./routes/gps.routes');
const busRoutes = require('./routes/bus.routes');
const complaintsRoutes = require('./routes/complaints.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration for frontend communication
// CORS configuration for frontend communication
const corsOptions = {
  origin: '*', // Allow all origins for development (Mobile/LAN access)
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (images/videos) as static content
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('[APP] Static uploads folder served at /uploads');

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: process.env.APP_NAME || 'TrackNGo Backend',
    region: process.env.REGION || 'Thanjavur',
    version: '1.0.0'
  });
});

// API Routes (Order matters! More specific routes first)
app.use('/api/gps', gpsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/auth', authRoutes); // Must come BEFORE /api
app.use('/api/settings', settingsRoutes);
app.use('/api', busRoutes); // Generic /api catch-all, must be last

console.log('[APP] All routes mounted successfully');

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    message: 'TrackNGo Backend API',
    region: 'Thanjavur',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      gpsUpdate: 'POST /api/gps/update',
      activeBuses: 'GET /api/buses',
      routes: 'GET /api/routes',
      websocket: 'WS /ws/live',
      complaints: 'POST /api/complaints'
    },
    documentation: 'See README.md for complete API documentation'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid API endpoint`,
    availableEndpoints: [
      'GET /health',
      'POST /api/gps/update',
      'GET /api/buses',
      'GET /api/routes'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);

  // Default error response
  const errorResponse = {
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json(errorResponse);
});

module.exports = app;