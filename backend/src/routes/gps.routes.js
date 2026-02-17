const express = require('express');
const router = express.Router();

const { validateGpsUpdate, checkRateLimit } = require('../utils/validation');
const { getInstance: getStorage } = require('../services/storage.service');
const WebSocketService = require('../services/websocket.service');
const safetyService = require('../services/safety.service');
const logger = require('../utils/logger');

/**
 * POST /api/gps/update
 * 
 * Receives GPS updates from buses and broadcasts to connected clients
 * 
 * Request body:
 * {
 *   "bus_id": "TN-THJ-23",
 *   "lat": 10.7869,
 *   "lng": 79.1378,
 *   "speed": 34,
 *   "route_id": "R12",
 *   "timestamp": 1700000000
 * }
 */
router.post('/update', async (req, res) => {
  const startTime = Date.now();

  try {
    // Rate limiting check
    const clientId = req.ip || 'unknown';
    const rateLimit = checkRateLimit(clientId, 60, 60000); // 60 requests per minute

    if (!rateLimit.allowed) {
      logger.security('Rate limit exceeded', { client_id: clientId });
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many GPS updates. Please slow down.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    // Validate GPS update data
    const validation = validateGpsUpdate(req.body);

    if (!validation.isValid) {
      logger.warn('Invalid GPS data received', {
        client_id: clientId,
        errors: validation.errors
      });
      return res.status(400).json({
        error: 'Invalid GPS data',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Log warnings but continue processing
    if (validation.warnings.length > 0) {
      logger.warn('GPS data has warnings', {
        bus_id: validation.data.bus_id,
        warnings: validation.warnings
      });
    }

    // Calculate Safety Score
    const safetyResult = safetyService.processSafetyScore(
      validation.data.bus_id,
      validation.data.speed || 0,
      validation.data.timestamp,
      validation.data.timestamp_ms // Pass high-precision timestamp
    );

    // Attach score to bus data
    validation.data.safety_score = safetyResult.score;
    validation.data.violations = safetyResult.violations;

    // Store GPS update
    const storage = getStorage();
    const updateResult = storage.updateBusLocation(validation.data);

    if (!updateResult.success) {
      console.log(`⚠️  Failed to store GPS update: ${updateResult.reason}`);

      // For stale data, return 202 (Accepted but not processed)
      if (updateResult.reason === 'stale_data') {
        return res.status(202).json({
          message: 'GPS update received but ignored (stale data)',
          bus_id: validation.data.bus_id,
          timestamp: validation.data.timestamp
        });
      }

      // For other errors, return 400
      return res.status(400).json({
        error: 'Failed to process GPS update',
        reason: updateResult.reason
      });
    }

    // Calculate ETA if route is available
    let etaInfo = null;
    if (updateResult.bus.route_id) {
      try {
        const etaService = require('../services/eta.service');
        etaInfo = etaService.calculateETA(
          updateResult.bus.lat,
          updateResult.bus.lng,
          updateResult.bus.speed || 0,
          updateResult.bus.route_id
        );

        // Update bus object with ETA
        if (etaInfo && etaInfo.eta) {
          updateResult.bus.eta = etaInfo.eta;
          updateResult.bus.nextStop = etaInfo.nextStop;

          // Update in storage
          storage.updateBusLocation({
            ...updateResult.bus,
            eta: etaInfo.eta,
            next_stop: etaInfo.nextStop
          });
        }
      } catch (etaError) {
        console.error(`⚠️  ETA calculation failed for bus ${updateResult.bus.bus_id}:`, etaError.message);
        // Continue without ETA - not critical
      }
    }

    // Broadcast update to WebSocket clients
    try {
      const wsService = WebSocketService.getInstance();
      if (wsService) {
        wsService.broadcastBusUpdate({
          type: 'BUS_UPDATE',
          data: updateResult.bus
        });
      }
    } catch (wsError) {
      console.error('⚠️  Failed to broadcast WebSocket update:', wsError.message);
      // Continue - GPS update was stored successfully
    }

    // Performance logging
    const processingTime = Date.now() - startTime;
    logger.gpsUpdate(
      updateResult.bus.bus_id,
      updateResult.bus.lat,
      updateResult.bus.lng,
      updateResult.bus.speed,
      updateResult.bus.route_id,
      processingTime
    );

    // Success response
    res.status(200).json({
      message: 'GPS update processed successfully',
      bus_id: updateResult.bus.bus_id,
      timestamp: updateResult.bus.timestamp,
      eta: updateResult.bus.eta || null,
      nextStop: updateResult.bus.nextStop || null,
      safety_score: updateResult.bus.safety_score,
      violations: updateResult.bus.violations || [],
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ GPS update error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process GPS update',
      processingTime: `${processingTime}ms`
    });
  }
});

/**
 * GET /api/gps/stats
 * 
 * Get GPS processing statistics (for debugging)
 */
router.get('/stats', (req, res) => {
  try {
    const storage = getStorage();
    const stats = storage.getStats();

    res.json({
      message: 'GPS processing statistics',
      ...stats,
      endpoint: '/api/gps/update'
    });
  } catch (error) {
    console.error('Error getting GPS stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics'
    });
  }
});

/**
 * POST /api/gps/test
 * 
 * Test endpoint for sending mock GPS data (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', (req, res) => {
    const mockData = {
      bus_id: req.body.bus_id || 'TN-THJ-99',
      lat: req.body.lat || (10.7869 + (Math.random() - 0.5) * 0.1),
      lng: req.body.lng || (79.1378 + (Math.random() - 0.5) * 0.1),
      speed: req.body.speed || Math.floor(Math.random() * 60),
      route_id: req.body.route_id || 'R12',
      timestamp: Math.floor(Date.now() / 1000)
    };

    console.log('🧪 Test GPS data:', mockData);

    // Forward to actual update endpoint
    req.body = mockData;
    router.post('/update')(req, res);
  });
}

module.exports = router;