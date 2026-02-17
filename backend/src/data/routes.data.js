/**
 * Predefined Route Data for Thanjavur Region
 * 
 * Contains route coordinates, bus stops, and route metadata
 * Used for ETA calculations and route visualization
 * 
 * Coordinate system: WGS84 (standard GPS coordinates)
 * Region: Thanjavur District, Tamil Nadu, India
 */

const THANJAVUR_ROUTES = {
  'R12': {
    id: 'R12',
    name: 'New Bus Stand - Medical College',
    description: 'Direct route from New Bus Stand to Medical College via Old Bus Stand',
    color: '#2563eb',
    isActive: true,
    totalDistance: 2.5, // approximate
    averageSpeed: 30, // in town speed

    // Route waypoints
    coordinates: [
      { lat: 10.749, lng: 79.113 }, // New Bus Stand
      { lat: 10.786, lng: 79.136 }  // Old Bus Stand
    ],

    // Official bus stops
    stops: [
      {
        id: 'CBS002',
        name: 'New Bus Stand',
        lat: 10.749,
        lng: 79.113,
        distanceKm: 0,
        order: 1
      },
      {
        id: 'OBS002',
        name: 'Old Bus Stand',
        lat: 10.786,
        lng: 79.136,
        distanceKm: 4.8, // Approximate distance
        order: 2
      }
    ]
  },

  'R15': {
    id: 'R15',
    name: 'Thanjavur - Trichy Highway',
    description: 'Direct highway route to Tiruchirappalli via Orathanadu',
    color: '#dc2626',
    isActive: true,
    totalDistance: 52.3,
    averageSpeed: 45,

    coordinates: [
      { lat: 10.7869, lng: 79.1378 }, // Thanjavur Bus Stand
      { lat: 10.7890, lng: 79.1350 }, // Thanjavur Junction
      { lat: 10.7950, lng: 79.1280 }, // Pudukkottai Road
      { lat: 10.8050, lng: 79.1200 }, // Orathanadu Junction
      { lat: 10.8150, lng: 79.1100 }, // Orathanadu
      { lat: 10.8250, lng: 79.1000 }, // Pattukkottai Road
      { lat: 10.8350, lng: 79.0900 }, // Pattukkottai
      { lat: 10.8450, lng: 79.0800 }, // Aranthangi Road
      { lat: 10.7905, lng: 78.7047 }  // Trichy Central Bus Stand
    ],

    stops: [
      {
        id: 'TJ_BS',
        name: 'Thanjavur Bus Stand',
        lat: 10.7869,
        lng: 79.1378,
        distanceKm: 0,
        order: 1
      },
      {
        id: 'TJ_JN',
        name: 'Thanjavur Junction',
        lat: 10.7890,
        lng: 79.1350,
        distanceKm: 2.1,
        order: 2
      },
      {
        id: 'PD_RD',
        name: 'Pudukkottai Road',
        lat: 10.7950,
        lng: 79.1280,
        distanceKm: 5.8,
        order: 3
      },
      {
        id: 'OR_JN',
        name: 'Orathanadu Junction',
        lat: 10.8050,
        lng: 79.1200,
        distanceKm: 12.4,
        order: 4
      },
      {
        id: 'OR_TN',
        name: 'Orathanadu',
        lat: 10.8150,
        lng: 79.1100,
        distanceKm: 16.7,
        order: 5
      },
      {
        id: 'PT_RD',
        name: 'Pattukkottai Road',
        lat: 10.8250,
        lng: 79.1000,
        distanceKm: 22.3,
        order: 6
      },
      {
        id: 'PT_TN',
        name: 'Pattukkottai',
        lat: 10.8350,
        lng: 79.0900,
        distanceKm: 28.9,
        order: 7
      },
      {
        id: 'AR_RD',
        name: 'Aranthangi Road',
        lat: 10.8450,
        lng: 79.0800,
        distanceKm: 35.6,
        order: 8
      },
      {
        id: 'TC_BS',
        name: 'Trichy Central',
        lat: 10.7905,
        lng: 78.7047,
        distanceKm: 52.3,
        order: 9
      }
    ]
  },

  'R08': {
    id: 'R08',
    name: 'Thanjavur - Mayiladuthurai Coastal',
    description: 'Coastal route via Thiruvaiyaru and Needamangalam',
    color: '#059669',
    isActive: true,
    totalDistance: 42.8,
    averageSpeed: 38,

    coordinates: [
      { lat: 10.7869, lng: 79.1378 }, // Thanjavur Bus Stand
      { lat: 10.7920, lng: 79.1450 }, // Thiruvaiyaru Road
      { lat: 10.7980, lng: 79.1550 }, // Thiruvaiyaru
      { lat: 10.8050, lng: 79.1680 }, // Thiruvidaimarudur Road
      { lat: 10.8150, lng: 79.1850 }, // Needamangalam
      { lat: 10.8250, lng: 79.2100 }, // Tharangambadi Road
      { lat: 10.8350, lng: 79.2300 }, // Sirkazhi Junction
      { lat: 10.8450, lng: 79.2500 }, // Kollidam Bridge
      { lat: 11.1085, lng: 79.8275 }  // Mayiladuthurai Bus Stand
    ],

    stops: [
      {
        id: 'TJ_BS',
        name: 'Thanjavur Bus Stand',
        lat: 10.7869,
        lng: 79.1378,
        distanceKm: 0,
        order: 1
      },
      {
        id: 'TV_RD',
        name: 'Thiruvaiyaru Road',
        lat: 10.7920,
        lng: 79.1450,
        distanceKm: 3.2,
        order: 2
      },
      {
        id: 'TV_TN',
        name: 'Thiruvaiyaru',
        lat: 10.7980,
        lng: 79.1550,
        distanceKm: 7.8,
        order: 3
      },
      {
        id: 'TM_RD',
        name: 'Thiruvidaimarudur Road',
        lat: 10.8050,
        lng: 79.1680,
        distanceKm: 12.5,
        order: 4
      },
      {
        id: 'ND_TN',
        name: 'Needamangalam',
        lat: 10.8150,
        lng: 79.1850,
        distanceKm: 18.7,
        order: 5
      },
      {
        id: 'TG_RD',
        name: 'Tharangambadi Road',
        lat: 10.8250,
        lng: 79.2100,
        distanceKm: 24.3,
        order: 6
      },
      {
        id: 'SK_JN',
        name: 'Sirkazhi Junction',
        lat: 10.8350,
        lng: 79.2300,
        distanceKm: 30.8,
        order: 7
      },
      {
        id: 'KD_BR',
        name: 'Kollidam Bridge',
        lat: 10.8450,
        lng: 79.2500,
        distanceKm: 36.4,
        order: 8
      },
      {
        id: 'MY_BS',
        name: 'Mayiladuthurai Bus Stand',
        lat: 11.1085,
        lng: 79.8275,
        distanceKm: 42.8,
        order: 9
      }
    ]
  }
};

// All bus stops across all routes (for visualization)
const ALL_BUS_STOPS = [
  { id: 'CBS002', name: 'New Bus Stand', lat: 10.749, lng: 79.113, type: 'major' },
  { id: 'OBS002', name: 'Old Bus Stand', lat: 10.786, lng: 79.136, type: 'regular' }
];

/**
 * Get route by ID
 */
function getRouteById(routeId) {
  return THANJAVUR_ROUTES[routeId] || null;
}

/**
 * Get all available routes
 */
function getAllRoutes() {
  return Object.values(THANJAVUR_ROUTES);
}

/**
 * Get all active routes
 */
function getActiveRoutes() {
  return Object.values(THANJAVUR_ROUTES).filter(route => route.isActive);
}

/**
 * Get all bus stops
 */
function getAllBusStops() {
  return ALL_BUS_STOPS;
}

/**
 * Get bus stops for a specific route
 */
function getBusStopsByRoute(routeId) {
  const route = getRouteById(routeId);
  return route ? route.stops : [];
}

/**
 * Find nearest bus stop to given coordinates
 */
function findNearestBusStop(lat, lng, maxDistanceKm = 1) {
  const { calculateDistance } = require('../utils/validation');

  let nearestStop = null;
  let minDistance = maxDistanceKm;

  for (const stop of ALL_BUS_STOPS) {
    const distance = calculateDistance(lat, lng, stop.lat, stop.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = { ...stop, distance };
    }
  }

  return nearestStop;
}

/**
 * Get route statistics
 */
function getRouteStats() {
  const routes = getAllRoutes();
  return {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.isActive).length,
    totalStops: ALL_BUS_STOPS.length,
    totalDistance: routes.reduce((sum, route) => sum + route.totalDistance, 0),
    avgRouteDistance: routes.length > 0 ?
      routes.reduce((sum, route) => sum + route.totalDistance, 0) / routes.length : 0
  };
}

module.exports = {
  THANJAVUR_ROUTES,
  ALL_BUS_STOPS,
  getRouteById,
  getAllRoutes,
  getActiveRoutes,
  getAllBusStops,
  getBusStopsByRoute,
  findNearestBusStop,
  getRouteStats
};