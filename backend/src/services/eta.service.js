/**
 * ETA (Estimated Time of Arrival) Calculation Service
 * 
 * Calculates estimated arrival times for buses based on:
 * - Current GPS location
 * - Current speed
 * - Predefined route data
 * - Distance calculations using Haversine formula
 * 
 * Backend-only implementation - no external APIs used
 */

const { getRouteById } = require('../data/routes.data');
const { calculateDistance, isPointNearRoute } = require('../utils/validation');

/**
 * Main ETA calculation function
 * 
 * @param {number} currentLat - Current latitude of the bus
 * @param {number} currentLng - Current longitude of the bus
 * @param {number} currentSpeed - Current speed in km/h
 * @param {string} routeId - Route ID (e.g., 'R12')
 * @returns {Object} ETA information with next stop and time
 */
function calculateETA(currentLat, currentLng, currentSpeed, routeId) {
  try {
    // Get route data
    const route = getRouteById(routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    // Validate inputs
    if (!isValidLocation(currentLat, currentLng)) {
      throw new Error('Invalid GPS coordinates');
    }

    // Find current position on route
    const routePosition = findPositionOnRoute(currentLat, currentLng, route);
    
    if (!routePosition.onRoute) {
      console.log(`⚠️  Bus appears to be off-route (${routePosition.distanceFromRoute.toFixed(2)}km away)`);
      // Still calculate ETA to nearest stop
    }

    // Find next stop
    const nextStop = findNextStop(routePosition.nearestIndex, route);
    
    if (!nextStop) {
      return {
        eta: 'End of route',
        etaMinutes: 0,
        nextStop: 'Final destination',
        distanceKm: 0,
        routeCompletion: 100
      };
    }

    // Calculate distance to next stop
    const distanceToStop = calculateDistanceToStop(
      currentLat, 
      currentLng, 
      nextStop, 
      route, 
      routePosition.nearestIndex
    );

    // Calculate ETA based on speed
    const etaInfo = calculateTimeEstimate(distanceToStop, currentSpeed, route.averageSpeed);

    // Calculate route completion percentage
    const routeCompletion = calculateRouteCompletion(routePosition.nearestIndex, route);

    const result = {
      eta: etaInfo.etaFormatted,
      etaMinutes: etaInfo.etaMinutes,
      nextStop: nextStop.name,
      nextStopId: nextStop.id,
      distanceKm: Math.round(distanceToStop * 100) / 100,
      routeCompletion: Math.round(routeCompletion),
      estimatedSpeed: etaInfo.estimatedSpeed,
      onRoute: routePosition.onRoute
    };

    console.log(`🕐 ETA calculated for route ${routeId}: ${result.eta} to ${result.nextStop}`);
    return result;

  } catch (error) {
    console.error(`❌ ETA calculation error for route ${routeId}:`, error.message);
    return {
      eta: 'Unknown',
      etaMinutes: null,
      nextStop: 'Unknown',
      error: error.message
    };
  }
}

/**
 * Find bus position on route path
 */
function findPositionOnRoute(lat, lng, route) {
  const coordinates = route.coordinates;
  let nearestIndex = 0;
  let minDistance = Number.MAX_VALUE;

  // Find closest point on route
  for (let i = 0; i < coordinates.length; i++) {
    const distance = calculateDistance(lat, lng, coordinates[i].lat, coordinates[i].lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  // Check if bus is reasonably close to route (within 1km)
  const isOnRoute = minDistance <= 1.0;

  return {
    nearestIndex,
    distanceFromRoute: minDistance,
    onRoute: isOnRoute,
    nearestCoordinate: coordinates[nearestIndex]
  };
}

/**
 * Find the next bus stop along the route
 */
function findNextStop(currentRouteIndex, route) {
  const stops = route.stops;
  
  // Find next stop that comes after current position
  for (const stop of stops) {
    // Check if this stop is ahead on the route
    const stopIndex = findStopIndex(stop, route.coordinates);
    if (stopIndex >= currentRouteIndex) {
      return stop;
    }
  }

  // If no stop found ahead, return null (end of route)
  return null;
}

/**
 * Find the index of a stop in the route coordinates
 */
function findStopIndex(stop, coordinates) {
  let minDistance = Number.MAX_VALUE;
  let stopIndex = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const distance = calculateDistance(
      stop.lat, stop.lng,
      coordinates[i].lat, coordinates[i].lng
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      stopIndex = i;
    }
  }

  return stopIndex;
}

/**
 * Calculate distance from current position to next stop
 */
function calculateDistanceToStop(currentLat, currentLng, nextStop, route, currentIndex) {
  // Option 1: Direct distance (as the crow flies)
  const directDistance = calculateDistance(currentLat, currentLng, nextStop.lat, nextStop.lng);

  // Option 2: Route-based distance (following the path)
  const routeDistance = calculateRouteDistance(currentLat, currentLng, nextStop, route, currentIndex);

  // Use route-based distance if available and reasonable, otherwise use direct
  return routeDistance > 0 && routeDistance < (directDistance * 2) ? routeDistance : directDistance;
}

/**
 * Calculate distance following the route path
 */
function calculateRouteDistance(currentLat, currentLng, nextStop, route, currentIndex) {
  try {
    const coordinates = route.coordinates;
    let totalDistance = 0;

    // Distance from current position to nearest route point
    totalDistance += calculateDistance(
      currentLat, currentLng,
      coordinates[currentIndex].lat, coordinates[currentIndex].lng
    );

    // Distance along route segments to stop
    const stopIndex = findStopIndex(nextStop, coordinates);
    
    for (let i = currentIndex; i < Math.min(stopIndex, coordinates.length - 1); i++) {
      totalDistance += calculateDistance(
        coordinates[i].lat, coordinates[i].lng,
        coordinates[i + 1].lat, coordinates[i + 1].lng
      );
    }

    // Distance from last route point to actual stop
    if (stopIndex < coordinates.length) {
      totalDistance += calculateDistance(
        coordinates[stopIndex].lat, coordinates[stopIndex].lng,
        nextStop.lat, nextStop.lng
      );
    }

    return totalDistance;

  } catch (error) {
    console.error('Error calculating route distance:', error.message);
    return 0;
  }
}

/**
 * Calculate time estimate based on distance and speed
 */
function calculateTimeEstimate(distanceKm, currentSpeed, routeAverageSpeed) {
  // Determine speed to use for calculation
  let estimatedSpeed = currentSpeed;

  // Use route average if current speed is 0 or unreasonable
  if (currentSpeed <= 0 || currentSpeed > 100) {
    estimatedSpeed = routeAverageSpeed || 30; // Default 30 km/h
  }

  // Apply speed adjustments for traffic conditions
  if (estimatedSpeed < 10) {
    estimatedSpeed = Math.max(estimatedSpeed, 15); // Minimum reasonable speed in traffic
  }

  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / estimatedSpeed;
  const timeMinutes = timeHours * 60;

  // Format ETA string
  const etaFormatted = formatETA(timeMinutes);

  return {
    etaMinutes: Math.round(timeMinutes),
    etaFormatted,
    estimatedSpeed: Math.round(estimatedSpeed)
  };
}

/**
 * Format ETA into human-readable string
 */
function formatETA(minutes) {
  if (minutes < 1) {
    return 'Arriving now';
  } else if (minutes < 60) {
    return `${Math.round(minutes)} min${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

/**
 * Calculate how much of the route has been completed
 */
function calculateRouteCompletion(currentIndex, route) {
  const totalPoints = route.coordinates.length;
  if (totalPoints <= 1) return 100;
  
  return (currentIndex / (totalPoints - 1)) * 100;
}

/**
 * Validate GPS coordinates
 */
function isValidLocation(lat, lng) {
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

/**
 * Get ETA for multiple buses on a route
 */
function calculateMultipleBusETA(routeId) {
  try {
    const { getInstance: getStorage } = require('./storage.service');
    const storage = getStorage();
    const buses = storage.getBusesByRoute(routeId);

    const etaResults = buses.map(bus => {
      const eta = calculateETA(bus.lat, bus.lng, bus.speed || 0, routeId);
      return {
        bus_id: bus.bus_id,
        ...eta
      };
    });

    return {
      route_id: routeId,
      buses: etaResults,
      total: etaResults.length
    };

  } catch (error) {
    console.error(`❌ Multi-bus ETA calculation error for route ${routeId}:`, error.message);
    return {
      route_id: routeId,
      buses: [],
      error: error.message
    };
  }
}

/**
 * Get estimated arrival times for all buses at a specific stop
 */
function getStopArrivalTimes(stopId) {
  try {
    const { getInstance: getStorage } = require('./storage.service');
    const { getAllRoutes } = require('../data/routes.data');
    
    const storage = getStorage();
    const routes = getAllRoutes();
    const arrivals = [];

    // Check all routes that serve this stop
    routes.forEach(route => {
      const stopExists = route.stops.some(stop => stop.id === stopId);
      if (!stopExists) return;

      const buses = storage.getBusesByRoute(route.id);
      
      buses.forEach(bus => {
        const eta = calculateETA(bus.lat, bus.lng, bus.speed || 0, route.id);
        
        // Only include if this stop is the next stop for this bus
        if (eta.nextStopId === stopId) {
          arrivals.push({
            bus_id: bus.bus_id,
            route_id: route.id,
            route_name: route.name,
            eta: eta.eta,
            etaMinutes: eta.etaMinutes
          });
        }
      });
    });

    // Sort by ETA
    arrivals.sort((a, b) => (a.etaMinutes || Infinity) - (b.etaMinutes || Infinity));

    return {
      stop_id: stopId,
      arrivals,
      total: arrivals.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Stop arrival times error for ${stopId}:`, error.message);
    return {
      stop_id: stopId,
      arrivals: [],
      error: error.message
    };
  }
}

module.exports = {
  calculateETA,
  calculateMultipleBusETA,
  getStopArrivalTimes,
  formatETA
};