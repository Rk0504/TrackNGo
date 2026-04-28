/**
 * Speed Limit Service for TrackNGo
 *
 * Fetches the real road speed limit for a given GPS coordinate
 * using the Ola Maps (Krutrim) Roads API. 
 *
 * ONLY called for Mobile GPS buses to conserve external requests.
 */

const DEFAULT_SPEED_LIMIT = 40; // km/h fallback
const CACHE_TTL_MS = 60 * 1000; // Cache speed limits for 60 seconds per location

class SpeedLimitService {
    constructor() {
        this.cache = new Map(); // "lat_lng_rounded" -> { speedLimit, expiresAt }
    }

    getApiKey() {
        return process.env.OLA_MAPS_API_KEY;
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
        const apiKey = this.getApiKey();

        if (!apiKey) {
            console.warn('⚠️ OLA_MAPS_API_KEY is not set. Falling back to default speed limit.');
            return DEFAULT_SPEED_LIMIT;
        }

        // Round to 4 decimal places (~11m precision) for cache key
        const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.speedLimit;
        }

        try {
            // Ola Maps Speed Limits API endpoint
            const url = `https://api.olamaps.io/routing/v1/speedLimits?points=${lat},${lng}&snapStrategy=snaptoroad&api_key=${apiKey}`;

            const response = await fetch(url, {
                signal: AbortSignal.timeout(4000) // 4 second timeout
            });

            if (!response.ok) {
                console.warn(`⚠️ Ola Maps API returned ${response.status}. Using default speed limit.`);
                return DEFAULT_SPEED_LIMIT;
            }

            const data = await response.json();
            
            // Extract speed limit from Ola Maps response
            // Example response: { "snappedPoints": [...], "speedLimits": [{ "speedLimit": 60, "unit": "KMPH" }] }
            if (data && data.speedLimits && data.speedLimits.length > 0) {
                const limit = data.speedLimits[0].speedLimit;
                
                if (limit && !isNaN(limit)) {
                    console.log(`🛣️ [Ola Maps] Speed limit for (${lat.toFixed(4)}, ${lng.toFixed(4)}): ${limit} km/h`);
                    
                    // Cache the result
                    this.cache.set(cacheKey, {
                        speedLimit: limit,
                        expiresAt: Date.now() + CACHE_TTL_MS
                    });
                    
                    return limit;
                }
            }
            
            console.log(`🛣️ [Ola Maps] No specific limit found. Using default: ${DEFAULT_SPEED_LIMIT} km/h`);
            return DEFAULT_SPEED_LIMIT;

        } catch (err) {
            if (err.name !== 'TimeoutError') {
                console.warn(`⚠️ Ola Maps fetch failed: ${err.message}`);
            }
            return DEFAULT_SPEED_LIMIT;
        }
    }
}

// Singleton instance
const speedLimitService = new SpeedLimitService();
module.exports = speedLimitService;
