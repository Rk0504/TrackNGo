/**
 * Safety Service for TrackNGo
 * 
 * Calculates safety scores based on driving behavior:
 * - Overspeeding: -3 points
 * - Harsh Braking: -5 points
 * - Sudden Acceleration: -10 points
 */

class SafetyService {
    constructor() {
        this.busStates = new Map(); // busId -> { score, lastSpeed, lastTimestamp }

        // Constants
        this.MAX_SCORE = 100;
        this.MIN_SCORE = 0;
        // Thresholds
        this.SPEED_LIMIT = 40; // km/h (User Specified)

        // G-Force Thresholds (g = 9.81 m/s^2)
        this.ACCEL_THRESHOLD_G = 0.22; // +0.22g for Sudden Acceleration
        this.BRAKE_THRESHOLD_G = 0.265; // -0.265g for Harsh Braking

        // Penalties
        this.PENALTY_OVERSPEED = 5;
        this.PENALTY_BRAKING = 3;
        this.PENALTY_ACCEL = 10;

        // Recovery (Bonus points for good driving over time - Optional, maybe later)
        // For now, simpler is better.
    }

    /**
     * Process GPS update and calculate safety score
     * @param {string} busId 
     * @param {number} currentSpeed (km/h)
     * @param {number} timestamp (seconds)
     * @returns {Object} { score, violations }
     */
    processSafetyScore(busId, currentSpeed, timestamp, timestampMs = null) {
        // Initialize state if new bus
        if (!this.busStates.has(busId)) {
            this.busStates.set(busId, {
                score: this.MAX_SCORE,
                speedHistory: [], // Array of { speed, timeMs }
                overspeedStartTime: null,
                lastViolationTime: 0,
                violations: []
            });
            return { score: this.MAX_SCORE, violations: [] };
        }

        const state = this.busStates.get(busId);
        const violations = [];
        let newScore = state.score;

        // Current Time in MS
        const nowMs = timestampMs || (timestamp * 1000);

        // Add to history
        state.speedHistory.push({ speed: currentSpeed, timeMs: nowMs });

        // Prune history (keep last 5 seconds max)
        const historyWindowMs = 5000;
        state.speedHistory = state.speedHistory.filter(entry => (nowMs - entry.timeMs) <= historyWindowMs);

        // 1. Check Overspeeding (Speed > 40 km/h for > 2 seconds)
        // Rule: If speed > 40 km/h for more than 2 seconds, 2 points deducted.
        if (currentSpeed > 40) {
            if (!state.overspeedStartTime) {
                state.overspeedStartTime = nowMs;
            } else {
                const duration = nowMs - state.overspeedStartTime;
                if (duration > 2000) { // > 2 seconds
                    // Deduct points
                    // We add a cooldown or valid check to ensure we don't deduct continuously?
                    // "2 points will be deducted". Simple interpretation: Deduct once per "event" of exceeding 2s?
                    // Or every 2s block? Let's treat it as: Once we cross 2s mark, deduct, and reset timer to penalize again if it continues?
                    // Let's reset timer to penalize every 2s of overspeeding.
                    newScore -= 2;
                    violations.push('Overspeeding');
                    console.log(`⚠️ Violation [${busId}]: Overspeeding (>40km/h for 2s)`);
                    state.overspeedStartTime = nowMs; // Reset timer to count next 2s
                }
            }
        } else {
            state.overspeedStartTime = null;
        }

        // 2 & 3. Harsh Braking / Sudden Acceleration (3-second window)
        // "3 seconds is the time taken for calculation"
        // Formula: G-Force = (Final - Initial) / (time * 35.316)

        // Find record closely matching 3 seconds ago
        const targetTime = nowMs - 3000;
        // Find entry with closest timeMs to targetTime
        let statsInitial = state.speedHistory[0];
        let minDiff = Math.abs(state.speedHistory[0].timeMs - targetTime);

        for (let i = 1; i < state.speedHistory.length; i++) {
            const diff = Math.abs(state.speedHistory[i].timeMs - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                statsInitial = state.speedHistory[i];
            }
        }

        // Only calculate if we have a robust delta (at least 1s difference to be meaningful, ideally close to 3s)
        const timeTakenSec = (nowMs - statsInitial.timeMs) / 1000;

        // Handle Mobile Testing vs Reality:
        // Real bus: 3s window is standard.
        // Mobile test: 3s might smooth out walking too much.
        // But user provided SPECIFIC formula with 3s. I will apply it.
        // To help mobile testing, we might need a shorter window if 3s yields no results?
        // Let's stick to the requested logic first.

        // Cooldown: Don't penalize same G-force event multiple times (sliding window overlap)
        const inCooldown = (nowMs - state.lastViolationTime) < 3000;

        if (timeTakenSec >= 0.5 && !inCooldown) { // Calc if at least 0.5s passed
            const vFinal = currentSpeed; // km/h
            const vInitial = statsInitial.speed; // km/h

            // Formula: G = (vFinal - vInitial) / (t * 35.316)
            const gForce = (vFinal - vInitial) / (timeTakenSec * 35.316);

            // Thresholds
            // Sudden Accel: > +0.22g (-3 points)
            // Harsh Braking: < -0.265g (-3 points)

            // Debug
            // console.log(`[Safety] ${busId} | dt: ${timeTakenSec.toFixed(2)}s | dV: ${(vFinal-vInitial).toFixed(1)} | G: ${gForce.toFixed(3)}`);

            if (gForce > 0.22) {
                newScore -= 3;
                violations.push('Sudden Acceleration');
                console.log(`⚠️ Violation [${busId}]: Sudden Accel (${gForce.toFixed(3)}g > 0.22g within ${timeTakenSec.toFixed(1)}s)`);
                state.lastViolationTime = nowMs;
            } else if (gForce < -0.265) {
                newScore -= 3;
                violations.push('Harsh Braking');
                console.log(`⚠️ Violation [${busId}]: Harsh Braking (${gForce.toFixed(3)}g < -0.265g within ${timeTakenSec.toFixed(1)}s)`);
                state.lastViolationTime = nowMs;
            }
        }

        // Clamp Score
        newScore = Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, newScore));

        state.score = newScore;

        // Keep violations history
        if (violations.length > 0) {
            state.violations.push(...violations);
            if (state.violations.length > 5) state.violations.shift();
        }

        return { score: newScore, violations: violations };
    }
}

// Singleton instance
const safetyService = new SafetyService();
module.exports = safetyService;
