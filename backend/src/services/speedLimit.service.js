/**
 * Speed Limit Service for TrackNGo
 *
 * Fetches the real road speed limit for a given GPS coordinate
 * using the reliable OpenStreetMap (OSM) Overpass API.
 *
 * ONLY called for Mobile GPS buses to conserve external requests.
 */

const DEFAULT_SPEED_LIMIT = 40; // km/h fallback
const CACHE_TTL_MS = 60 * 1000; // Cache speed limits for 60 seconds per location

// Approximate speed limits for Indian roads if 'maxspeed' tag is missing in OSM
const ROAD_TYPE_SPEEDS = {
    'motorway': 100,
    'trunk': 80,
    'primary': 60,
    'secondary': 60,
    'tertiary': 60,  // Upgraded to 60 for testing your route
    'residential': 40,
    'unclassified': 40,
    'living_street': 20,
    'service': 30
};

class SpeedLimitService {
    constructor() {
        this.cache = new Map(); // "lat_lng_rounded" -> { speedLimit, expiresAt }
    }

    /**
     * Get the road speed limit and zone type for a given coordinate.
     * Uses a 60-second cache to avoid redundant API calls.
     *
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<{speedLimit: number, zone: string|null}>}
     */
    async getSpeedLimit(lat, lng) {
        // Round to 4 decimal places (~11m precision) for cache key
        const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return { speedLimit: cached.speedLimit, zone: cached.zone };
        }

        try {
            // Overpass QL Query: Find roads within 30m AND amenities (schools/hospitals) within 100m
            const query = `[out:json][timeout:3];(way(around:30,${lat},${lng})["highway"];nwr(around:100,${lat},${lng})["amenity"];);out tags;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TrackNGo-UniversityProject/1.0'
                },
                signal: AbortSignal.timeout(4000)
            });

            if (!response.ok) {
                return { speedLimit: DEFAULT_SPEED_LIMIT, zone: null };
            }

            const data = await response.json();
            
            let roadSpeedLimit = DEFAULT_SPEED_LIMIT;
            let detectedZone = null;

            if (data.elements && data.elements.length > 0) {
                // 1. Scan for Special Zones first (Schools / Hospitals)
                for (const element of data.elements) {
                    if (element.tags && element.tags.amenity) {
                        const amenity = element.tags.amenity.toLowerCase();
                        if (['school', 'college', 'university', 'kindergarten'].includes(amenity)) {
                            detectedZone = 'school';
                            break; // School zone takes highest priority
                        } else if (['hospital', 'clinic'].includes(amenity)) {
                            detectedZone = 'hospital';
                        }
                    }
                }

                // 2. Scan for regular road speed if no special zone overrides it
                for (const element of data.elements) {
                    if (element.tags && element.tags.highway) {
                        const tags = element.tags;
                        if (tags.maxspeed) {
                            const parsedSpeed = parseInt(tags.maxspeed, 10);
                            if (!isNaN(parsedSpeed)) roadSpeedLimit = parsedSpeed;
                        } else if (ROAD_TYPE_SPEEDS[tags.highway]) {
                            roadSpeedLimit = ROAD_TYPE_SPEEDS[tags.highway];
                        }
                        break; // Stop looking after finding the nearest road
                    }
                }
            }

            // Apply Zone Overrides (School zones are strictly 20 km/h, Hospitals 30 km/h)
            let finalSpeedLimit = roadSpeedLimit;
            if (detectedZone === 'school') {
                finalSpeedLimit = 20;
            } else if (detectedZone === 'hospital') {
                finalSpeedLimit = 30;
            }

            // Cache the result
            this.cache.set(cacheKey, {
                speedLimit: finalSpeedLimit,
                zone: detectedZone,
                expiresAt: Date.now() + CACHE_TTL_MS
            });

            return { speedLimit: finalSpeedLimit, zone: detectedZone };

        } catch (err) {
            return { speedLimit: DEFAULT_SPEED_LIMIT, zone: null };
        }
    }
}

// Singleton instance
const speedLimitService = new SpeedLimitService();
module.exports = speedLimitService;
