/**
 * Speed Limit Service for TrackNGo
 *
 * Fetches the real road speed limit for a given GPS coordinate
 * using the OpenStreetMap (OSM) Overpass API. (Free, no API key needed).
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
    'secondary': 60, // Changed from 50
    'tertiary': 50,  // Changed from 40 to prove it's dynamic
    'residential': 30,
    'unclassified': 40,
    'living_street': 20,
    'service': 30
};

class SpeedLimitService {
    constructor() {
        this.cache = new Map(); // "lat_lng_rounded" -> { speedLimit, expiresAt }
    }

    /**
     * Get the road speed limit for a given coordinate.
     * Uses a 60-second cache to avoid redundant API calls.
     *
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<number>} Speed limit in km/h
     */
    async getSpeedLimit(lat, lng) {
        // Round to 4 decimal places (~11m precision) for cache key
        const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.speedLimit;
        }

        try {
            // Overpass QL Query: Find roads within 30 meters of the coordinates
            const query = `[out:json][timeout:3];way(around:30,${lat},${lng})["highway"];out tags 1;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TrackNGo-UniversityProject/1.0'
                },
                signal: AbortSignal.timeout(4000) // 4 second timeout
            });

            if (!response.ok) {
                console.warn(`⚠️ Overpass API returned ${response.status}. Using default speed limit.`);
                return DEFAULT_SPEED_LIMIT;
            }

            const data = await response.json();
            let finalSpeedLimit = DEFAULT_SPEED_LIMIT;

            if (data.elements && data.elements.length > 0) {
                const tags = data.elements[0].tags;
                
                // 1. Check if the road has an explicit maxspeed tag
                if (tags.maxspeed) {
                    const parsedSpeed = parseInt(tags.maxspeed, 10);
                    if (!isNaN(parsedSpeed)) {
                        finalSpeedLimit = parsedSpeed;
                        console.log(`🛣️ [OSM] Found explicit maxspeed: ${finalSpeedLimit} km/h for (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                    }
                } 
                // 2. If no explicit speed, guess based on the type of road (highway tag)
                else if (tags.highway) {
                    const roadType = tags.highway;
                    if (ROAD_TYPE_SPEEDS[roadType]) {
                        finalSpeedLimit = ROAD_TYPE_SPEEDS[roadType];
                        console.log(`🛣️ [OSM] Inferred from road type '${roadType}': ${finalSpeedLimit} km/h for (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                    } else {
                        console.log(`🛣️ [OSM] Unknown road type '${roadType}'. Using default: ${DEFAULT_SPEED_LIMIT} km/h`);
                    }
                }
            } else {
                console.log(`🛣️ [OSM] No roads found near (${lat.toFixed(4)}, ${lng.toFixed(4)}). Using default.`);
            }

            // Cache the result
            this.cache.set(cacheKey, {
                speedLimit: finalSpeedLimit,
                expiresAt: Date.now() + CACHE_TTL_MS
            });

            return finalSpeedLimit;

        } catch (err) {
            if (err.name !== 'TimeoutError') {
                console.warn(`⚠️ OSM Speed limit fetch failed: ${err.message}`);
            }
            return DEFAULT_SPEED_LIMIT;
        }
    }
}

// Singleton instance
const speedLimitService = new SpeedLimitService();
module.exports = speedLimitService;
