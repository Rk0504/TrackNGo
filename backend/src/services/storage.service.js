/**
 * In-Memory Storage Service for TrackNGo Backend
 * 
 * Stores bus location data, route information, and manages real-time state.
 * Uses Map data structures for O(1) lookup performance.
 * 
 * Design rationale:
 * - In-memory for simplicity and speed
 * - Easy to migrate to Redis or MongoDB later
 * - Perfect for real-time tracking use case
 * - No external dependencies required
 */

class StorageService {
  constructor() {
    // Active bus locations with latest GPS data
    // Key: bus_id, Value: { bus_id, lat, lng, speed, route_id, timestamp, eta }
    this.buses = new Map();

    // Connection tracking for cleanup
    // Key: bus_id, Value: { lastSeen, connectionCount }
    this.busConnections = new Map();

    // Performance metrics
    this.stats = {
      totalUpdates: 0,
      activeConnections: 0,
      lastUpdateTime: null,
      startTime: new Date()
    };

    console.log('✅ In-memory storage service initialized');

    // Start cleanup interval for stale buses
    this.startCleanupInterval();
  }

  /**
   * Update bus location and trigger real-time broadcasts
   */
  updateBusLocation(busData) {
    const { bus_id, lat, lng, speed, route_id, timestamp, safety_score, violations, ...otherFields } = busData;

    try {
      // Validate required fields
      if (!bus_id || lat === undefined || lng === undefined) {
        throw new Error('Missing required fields: bus_id, lat, lng');
      }

      const currentTime = Date.now() / 1000; // Unix timestamp
      const providedTimestamp = timestamp || currentTime;

      // Check for stale data
      const existingBus = this.buses.get(bus_id);
      if (existingBus && providedTimestamp <= existingBus.timestamp) {
        console.log(`⚠️  Ignoring stale GPS data for bus ${bus_id}`);
        return { success: false, reason: 'stale_data' };
      }

      // Create updated bus object
      const updatedBus = {
        ...(existingBus || {}), // Keep existing fields
        ...otherFields,         // Add new extra fields
        bus_id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: Math.max(0, parseFloat(speed) || 0),
        route_id: route_id || null,
        timestamp: providedTimestamp,
        lastUpdate: new Date().toISOString(),
        // Only update safety score if provided, else keep existing or default to 100
        safety_score: safety_score !== undefined ? safety_score : (existingBus?.safety_score || 100),
        violations: violations || []
      };

      // Store in memory
      this.buses.set(bus_id, updatedBus);

      // Update connection tracking
      this.busConnections.set(bus_id, {
        lastSeen: currentTime,
        connectionCount: (this.busConnections.get(bus_id)?.connectionCount || 0) + 1
      });

      // Update statistics
      this.stats.totalUpdates++;
      this.stats.lastUpdateTime = new Date();

      console.log(`📍 Updated location for bus ${bus_id} at (${lat}, ${lng})`);

      return { success: true, bus: updatedBus };

    } catch (error) {
      console.error(`❌ Failed to update bus ${bus_id}:`, error.message);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Get all active buses
   */
  getAllActiveBuses() {
    const activeBuses = Array.from(this.buses.values());
    console.log(`📋 Retrieved ${activeBuses.length} active buses`);
    return activeBuses;
  }

  /**
   * Get specific bus by ID
   */
  getBusById(busId) {
    const bus = this.buses.get(busId);
    if (!bus) {
      console.log(`🔍 Bus ${busId} not found`);
      return null;
    }
    return bus;
  }

  /**
   * Get buses by route ID
   */
  getBusesByRoute(routeId) {
    const routeBuses = Array.from(this.buses.values())
      .filter(bus => bus.route_id === routeId);

    console.log(`🚌 Found ${routeBuses.length} buses on route ${routeId}`);
    return routeBuses;
  }

  /**
   * Remove bus from active tracking
   */
  removeBus(busId) {
    const removed = this.buses.delete(busId);
    this.busConnections.delete(busId);

    if (removed) {
      console.log(`🗑️  Removed bus ${busId} from active tracking`);
    }

    return removed;
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const now = new Date();
    const uptimeMs = now - this.stats.startTime;

    return {
      ...this.stats,
      activeBuses: this.buses.size,
      uptimeMs,
      uptimeHours: Math.round(uptimeMs / (1000 * 60 * 60) * 100) / 100,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`
    };
  }

  /**
   * Cleanup stale buses that haven't sent updates recently
   */
  cleanupStaleBuses() {
    const maxAgeSeconds = parseInt(process.env.MAX_GPS_AGE_SECONDS) || 30;
    const currentTime = Date.now() / 1000;
    const staleBuses = [];

    for (const [busId, connection] of this.busConnections.entries()) {
      const ageSeconds = currentTime - connection.lastSeen;

      if (ageSeconds > maxAgeSeconds) {
        staleBuses.push(busId);
      }
    }

    // Remove stale buses
    staleBuses.forEach(busId => {
      this.removeBus(busId);
    });

    if (staleBuses.length > 0) {
      console.log(`🧹 Cleaned up ${staleBuses.length} stale buses:`, staleBuses);
    }

    return staleBuses;
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval() {
    const intervalMs = 60000; // 1 minute

    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleBuses();
    }, intervalMs);

    console.log(`🔄 Started cleanup interval: ${intervalMs}ms`);
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      console.log('🛑 Stopped cleanup interval');
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  clear() {
    this.buses.clear();
    this.busConnections.clear();
    this.stats.totalUpdates = 0;
    this.stats.lastUpdateTime = null;

    console.log('🗑️  Cleared all storage data');
  }

  /**
   * Get detailed debug information
   */
  getDebugInfo() {
    return {
      buses: Array.from(this.buses.entries()),
      connections: Array.from(this.busConnections.entries()),
      stats: this.getStats()
    };
  }
}

// Singleton instance
let instance = null;

module.exports = {
  StorageService,
  getInstance: () => {
    if (!instance) {
      instance = new StorageService();
    }
    return instance;
  }
};