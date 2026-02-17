/**
 * Validation utilities for GPS data and API inputs
 * 
 * Provides comprehensive validation for:
 * - GPS coordinates (lat/lng)
 * - Speed values
 * - Timestamps
 * - Bus IDs and route IDs
 * - Distance calculations using Haversine formula
 */

/**
 * Validate GPS coordinates
 */
function isValidLatitude(lat) {
  const latitude = parseFloat(lat);
  return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

function isValidLongitude(lng) {
  const longitude = parseFloat(lng);
  return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
}

function isValidCoordinates(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Validate speed (must be non-negative)
 */
function isValidSpeed(speed) {
  const speedValue = parseFloat(speed);
  const maxSpeed = parseFloat(process.env.MAX_SPEED_KMH) || 120;
  return !isNaN(speedValue) && speedValue >= 0 && speedValue <= maxSpeed;
}

/**
 * Validate timestamp (Unix timestamp in seconds)
 */
function isValidTimestamp(timestamp) {
  if (!timestamp) return true; // Optional field

  const ts = parseInt(timestamp);
  if (isNaN(ts)) return false;

  // Check if timestamp is reasonable (not too far in past/future)
  const now = Date.now() / 1000;
  const maxAgeSeconds = 300; // 5 minutes
  const maxFutureSeconds = 60; // 1 minute

  return (ts >= (now - maxAgeSeconds)) && (ts <= (now + maxFutureSeconds));
}

/**
 * Validate bus ID format
 */
function isValidBusId(busId) {
  if (!busId || typeof busId !== 'string') return false;

  // Expected format: TN-THJ-XX, or just basic alphanumeric for mobile testing
  const busIdPattern = /^[a-zA-Z0-9-]+$/;
  return busIdPattern.test(busId);
}

/**
 * Validate route ID format
 */
function isValidRouteId(routeId) {
  if (!routeId || typeof routeId !== 'string') return false;

  // Expected format: RXX (R followed by numbers)
  const routeIdPattern = /^R\d{2,3}$/;
  return routeIdPattern.test(routeId);
}

/**
 * Comprehensive GPS update validation
 */
function validateGpsUpdate(data) {
  const errors = [];
  const warnings = [];

  // Required fields validation
  if (!data.bus_id) {
    errors.push('bus_id is required');
  } else if (!isValidBusId(data.bus_id)) {
    errors.push('bus_id must follow format TN-THJ-XX (e.g., TN-THJ-23)');
  }

  if (data.lat === undefined || data.lat === null) {
    errors.push('lat (latitude) is required');
  } else if (!isValidLatitude(data.lat)) {
    errors.push('lat must be a valid latitude between -90 and 90');
  }

  if (data.lng === undefined || data.lng === null) {
    errors.push('lng (longitude) is required');
  } else if (!isValidLongitude(data.lng)) {
    errors.push('lng must be a valid longitude between -180 and 180');
  }

  // Optional fields validation
  if (data.speed !== undefined && !isValidSpeed(data.speed)) {
    errors.push(`speed must be between 0 and ${process.env.MAX_SPEED_KMH || 120} km/h`);
  }

  if (data.route_id && !isValidRouteId(data.route_id)) {
    warnings.push('route_id should follow format RXX (e.g., R12)');
  }

  if (data.timestamp && !isValidTimestamp(data.timestamp)) {
    warnings.push('timestamp appears to be invalid or too old');
  }

  // Thanjavur region boundary check (soft validation)
  if (isValidCoordinates(data.lat, data.lng)) {
    if (!isWithinThanjavurRegion(data.lat, data.lng)) {
      warnings.push('coordinates appear to be outside Thanjavur region');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: sanitizeGpsData(data)
  };
}

/**
 * Check if coordinates are within Thanjavur region boundaries
 */
function isWithinThanjavurRegion(lat, lng) {
  // Expanded boundaries to allow wide-range testing (covers generic South India/Tamil Nadu)
  // This allows you to test long-distance travel without "Out of region" warnings
  const thanjavurBounds = {
    north: 15.0,  // Extended North
    south: 8.0,   // Extended South (Kanyakumari)
    east: 82.0,   // Extended East
    west: 76.0    // Extended West
  };

  return (
    lat >= thanjavurBounds.south &&
    lat <= thanjavurBounds.north &&
    lng >= thanjavurBounds.west &&
    lng <= thanjavurBounds.east
  );
}

/**
 * Sanitize GPS data by converting types and removing invalid fields
 */
function sanitizeGpsData(data) {
  const sanitized = {
    bus_id: String(data.bus_id).trim(),
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    timestamp: data.timestamp ? parseInt(data.timestamp) : Math.floor(Date.now() / 1000)
  };

  // Add optional fields if valid
  if (data.speed !== undefined) {
    sanitized.speed = Math.max(0, parseFloat(data.speed) || 0);
  }

  if (data.route_id) {
    sanitized.route_id = String(data.route_id).trim();
  }

  return sanitized;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

/**
 * Calculate bearing (direction) from one point to another
 * Returns bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = toDegrees(Math.atan2(y, x));

  // Normalize to 0-360 degrees
  return (bearing + 360) % 360;
}

/**
 * Check if a point is near a route path (within tolerance)
 */
function isPointNearRoute(pointLat, pointLng, routeCoordinates, toleranceKm = 0.5) {
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segmentStart = routeCoordinates[i];
    const segmentEnd = routeCoordinates[i + 1];

    const distanceToSegment = distanceToLineSegment(
      pointLat, pointLng,
      segmentStart.lat, segmentStart.lng,
      segmentEnd.lat, segmentEnd.lng
    );

    if (distanceToSegment <= toleranceKm) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) {
    // Segment is a point
    return calculateDistance(px, py, x1, y1);
  }

  const param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return calculateDistance(px, py, xx, yy);
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Validate API request headers and body structure
 */
function validateApiRequest(req, expectedFields = []) {
  const errors = [];

  // Check content-type for POST requests
  if (req.method === 'POST' && !req.is('application/json')) {
    errors.push('Content-Type must be application/json');
  }

  // Check required fields
  expectedFields.forEach(field => {
    if (req.body[field] === undefined || req.body[field] === null) {
      errors.push(`Required field '${field}' is missing`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests for this identifier
  const requests = rateLimitStore.get(identifier) || [];

  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);

  // Check if rate limit exceeded
  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: Math.min(...recentRequests) + windowMs
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

  return {
    allowed: true,
    remainingRequests: maxRequests - recentRequests.length,
    resetTime: now + windowMs
  };
}

module.exports = {
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  isValidSpeed,
  isValidTimestamp,
  isValidBusId,
  isValidRouteId,
  validateGpsUpdate,
  isWithinThanjavurRegion,
  sanitizeGpsData,
  calculateDistance,
  calculateBearing,
  isPointNearRoute,
  distanceToLineSegment,
  toRadians,
  toDegrees,
  validateApiRequest,
  checkRateLimit
};