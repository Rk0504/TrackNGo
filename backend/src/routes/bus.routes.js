const express = require('express');
const router = express.Router();

const { getInstance: getStorage } = require('../services/storage.service');
const { getAllRoutes, getRouteById, getAllBusStops, getRouteStats } = require('../data/routes.data');
const { isValidRouteId } = require('../utils/validation');

/**
 * GET /api/buses
 * 
 * Get all active buses with their current locations and status
 * 
 * Query parameters:
 * - route_id: Filter buses by route (optional)
 * - format: Response format ('simple' | 'detailed') - default: detailed
 */
router.get('/buses', (req, res) => {
  try {
    const { route_id, format } = req.query;
    const storage = getStorage();
    
    // Get all buses or filter by route
    let buses;
    if (route_id) {
      if (!isValidRouteId(route_id)) {
        return res.status(400).json({
          error: 'Invalid route_id format',
          message: 'Route ID should follow format RXX (e.g., R12)'
        });
      }
      buses = storage.getBusesByRoute(route_id);
    } else {
      buses = storage.getAllActiveBuses();
    }

    // Format response based on request
    let responseData;
    if (format === 'simple') {
      responseData = buses.map(bus => ({
        bus_id: bus.bus_id,
        lat: bus.lat,
        lng: bus.lng,
        route_id: bus.route_id
      }));
    } else {
      // Detailed format (default)
      responseData = buses.map(bus => ({
        bus_id: bus.bus_id,
        lat: bus.lat,
        lng: bus.lng,
        speed: bus.speed || 0,
        eta: bus.eta || null,
        route_id: bus.route_id || null,
        next_stop: bus.next_stop || null,
        last_update: bus.lastUpdate,
        timestamp: bus.timestamp
      }));
    }

    console.log(`📋 Served ${responseData.length} buses${route_id ? ` for route ${route_id}` : ''}`);

    res.json({
      buses: responseData,
      total: responseData.length,
      route_filter: route_id || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving buses:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bus data'
    });
  }
});

/**
 * GET /api/buses/:busId
 * 
 * Get specific bus information by bus ID
 */
router.get('/buses/:busId', (req, res) => {
  try {
    const { busId } = req.params;
    const storage = getStorage();
    
    // Validate bus ID format
    if (!busId || typeof busId !== 'string') {
      return res.status(400).json({
        error: 'Invalid bus ID'
      });
    }

    const bus = storage.getBusById(busId);
    
    if (!bus) {
      return res.status(404).json({
        error: 'Bus not found',
        message: `Bus ${busId} is not currently active`,
        bus_id: busId
      });
    }

    console.log(`🔍 Retrieved details for bus ${busId}`);

    res.json({
      bus: {
        bus_id: bus.bus_id,
        lat: bus.lat,
        lng: bus.lng,
        speed: bus.speed || 0,
        eta: bus.eta || null,
        route_id: bus.route_id || null,
        next_stop: bus.next_stop || null,
        last_update: bus.lastUpdate,
        timestamp: bus.timestamp
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving bus details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bus details'
    });
  }
});

/**
 * GET /api/routes
 * 
 * Get all available routes with coordinates and stops
 * 
 * Query parameters:
 * - active_only: Return only active routes (true/false) - default: true
 * - include_stops: Include bus stops in response (true/false) - default: true
 */
router.get('/routes', (req, res) => {
  try {
    const { active_only = 'true', include_stops = 'true' } = req.query;
    const includeStops = include_stops === 'true';
    
    let routes = getAllRoutes();
    
    // Filter for active routes only
    if (active_only === 'true') {
      routes = routes.filter(route => route.isActive);
    }

    // Format route data
    const responseData = routes.map(route => {
      const routeData = {
        id: route.id,
        name: route.name,
        description: route.description,
        color: route.color,
        isActive: route.isActive,
        totalDistance: route.totalDistance,
        averageSpeed: route.averageSpeed,
        coordinates: route.coordinates
      };

      // Include stops if requested
      if (includeStops) {
        routeData.stops = route.stops;
      }

      return routeData;
    });

    console.log(`🗺️  Served ${responseData.length} routes`);

    res.json({
      routes: responseData,
      total: responseData.length,
      active_only: active_only === 'true',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving routes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve route data'
    });
  }
});

/**
 * GET /api/routes/:routeId
 * 
 * Get specific route information by route ID
 */
router.get('/routes/:routeId', (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Validate route ID
    if (!isValidRouteId(routeId)) {
      return res.status(400).json({
        error: 'Invalid route ID format',
        message: 'Route ID should follow format RXX (e.g., R12)'
      });
    }

    const route = getRouteById(routeId);
    
    if (!route) {
      return res.status(404).json({
        error: 'Route not found',
        message: `Route ${routeId} does not exist`,
        route_id: routeId
      });
    }

    // Get buses currently on this route
    const storage = getStorage();
    const routeBuses = storage.getBusesByRoute(routeId);

    console.log(`🗺️  Retrieved route ${routeId} with ${routeBuses.length} active buses`);

    res.json({
      route: {
        id: route.id,
        name: route.name,
        description: route.description,
        color: route.color,
        isActive: route.isActive,
        totalDistance: route.totalDistance,
        averageSpeed: route.averageSpeed,
        coordinates: route.coordinates,
        stops: route.stops
      },
      activeBuses: routeBuses.map(bus => ({
        bus_id: bus.bus_id,
        lat: bus.lat,
        lng: bus.lng,
        speed: bus.speed,
        eta: bus.eta
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving route details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve route details'
    });
  }
});

/**
 * GET /api/stops
 * 
 * Get all bus stops in the region
 */
router.get('/stops', (req, res) => {
  try {
    const stops = getAllBusStops();

    console.log(`🚏 Served ${stops.length} bus stops`);

    res.json({
      stops: stops,
      total: stops.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving bus stops:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bus stop data'
    });
  }
});

/**
 * GET /api/stats
 * 
 * Get system statistics and metrics
 */
router.get('/stats', (req, res) => {
  try {
    const storage = getStorage();
    const storageStats = storage.getStats();
    const routeStats = getRouteStats();

    const systemStats = {
      system: {
        uptime: storageStats.uptimeHours,
        memory: storageStats.memoryUsage,
        environment: process.env.NODE_ENV,
        region: process.env.REGION || 'Thanjavur'
      },
      buses: {
        active: storageStats.activeBuses,
        totalUpdates: storageStats.totalUpdates,
        lastUpdate: storageStats.lastUpdateTime
      },
      routes: routeStats,
      performance: {
        activeConnections: storageStats.activeConnections
      }
    };

    console.log('📊 Served system statistics');

    res.json({
      stats: systemStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve system statistics'
    });
  }
});

module.exports = router;