/**
 * Speed Limit Service for TrackNGo
 *
 * Fetches the real road speed limit for a given GPS coordinate
 * using the Google Maps Roads API (speedLimits endpoint).
 *
 * ONLY called for Mobile GPS buses (bus_id contains 'MOBILE')
 * to conserve API quota.
 *
 * Falls back to DEFAULT_SPEED_LIMIT (40 km/h) if:
 *  - API key is not configured
 *  - API call fails or times out
 *  - No speed limit data is returned for that road
 */

const DEFAULT_SPEED_LIMIT = 40; // km/h fallback
const CACHE_TTL_MS = 60 * 1000; // Cache speed limits for 60 seconds per location

class SpeedLimitService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
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
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            // No API key configured — use default
            return DEFAULT_SPEED_LIMIT;
        }

        // Round to 4 decimal places (~11m precision) for cache key
        const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.speedLimit;
        }

        try {
            const url = `https://roads.googleapis.com/v1/speedLimits?path=${lat},${lng}&key=${this.apiKey}`;

            // Use native fetch (Node 18+) or fallback
            const response = await fetch(url, {
                signal: AbortSignal.timeout(3000) // 3 second timeout to not block GPS updates
            });

            if (!response.ok) {
                console.warn(`⚠️ Roads API returned ${response.status}. Using default speed limit.`);
                return DEFAULT_SPEED_LIMIT;
            }

            const data = await response.json();

            // Extract speed limit from response
            // Response: { speedLimits: [{ placeId, speedLimit, units }] }
            if (data.speedLimits && data.speedLimits.length > 0) {
                let speedLimitKmh = data.speedLimits[0].speedLimit;

                // Convert MPH to KMH if needed (Google returns MPH for US roads)
                if (data.speedLimits[0].units === 'MPH') {
                    speedLimitKmh = Math.round(speedLimitKmh * 1.60934);
                }

                // Cache the result
                this.cache.set(cacheKey, {
                    speedLimit: speedLimitKmh,
                    expiresAt: Date.now() + CACHE_TTL_MS
                });

                console.log(`🛣️ Speed limit fetched for (${lat.toFixed(4)}, ${lng.toFixed(4)}): ${speedLimitKmh} km/h`);
                return speedLimitKmh;
            }

            // No data returned — use default
            return DEFAULT_SPEED_LIMIT;

        } catch (err) {
            // Timeout or network error — use default silently
            if (err.name !== 'TimeoutError') {
                console.warn(`⚠️ Speed limit fetch failed: ${err.message}`);
            }
            return DEFAULT_SPEED_LIMIT;
        }
    }

    /**
     * Check if the API key is configured and active
     */
    isConfigured() {
        return !!(this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE');
    }
}

// Singleton instance
const speedLimitService = new SpeedLimitService();
module.exports = speedLimitService;
