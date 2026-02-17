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
                lastSpeed: 0,
                lastTimestamp: timestamp,
                lastTimestampMs: timestampMs || (timestamp * 1000), // Initialize ms
                violations: []
            });
            return { score: this.MAX_SCORE, violations: [] };
        }

        const state = this.busStates.get(busId);
        const violations = [];
        let newScore = state.score;

        // Calculate time delta (in seconds)
        // Use high-precision timestampMs if available
        let timeDelta;

        if (timestampMs && state.lastTimestampMs) {
            timeDelta = (timestampMs - state.lastTimestampMs) / 1000;
        } else {
            timeDelta = timestamp - state.lastTimestamp;
        }

        // Skip if duplicate update or time travel
        if (timeDelta <= 0) {
            return { score: state.score, violations: [] };
        }

        // 1. Check Overspeeding
        if (currentSpeed > this.SPEED_LIMIT) {
            newScore -= this.PENALTY_OVERSPEED;
            violations.push('Overspeeding');
            console.log(`⚠️ Safety Violation [${busId}]: Overspeeding (${currentSpeed} km/h)`);
        }

        // Calculate Acceleration and G-Force
        // Convert speeds to m/s: (km/h) / 3.6
        const vFinal = currentSpeed / 3.6;
        const vInitial = state.lastSpeed / 3.6;

        // Acceleration (m/s^2) = (vFinal - vInitial) / time
        const acceleration = (vFinal - vInitial) / timeDelta;

        // G-Force = Acceleration / 9.81
        const gForce = acceleration / 9.81;

        // Debug Logging (Throttle this in high production, but critical for debugging now)
        if (Math.abs(gForce) > 0.15) {
            console.log(`[Safety] ${busId} | Speed: ${currentSpeed} | dV: ${(vFinal - vInitial).toFixed(2)} | dt: ${timeDelta.toFixed(3)} | Accel: ${acceleration.toFixed(2)} | G: ${gForce.toFixed(3)}`);
        }

        // ADAPTIVE THRESHOLDS: Check if this is a MOBILE test device
        // Mobile GPS is noisier and "human simulation" (running/walking) produces lower G-forces compared to a real bus stopping.
        const isMobile = busId && String(busId).includes('MOBILE');
        const accelThreshold = isMobile ? 0.06 : this.ACCEL_THRESHOLD_G; // extremely lower for walking test (0.06g)
        const brakeThreshold = isMobile ? 0.08 : this.BRAKE_THRESHOLD_G; // extremely lower for walking test (0.08g)

        // 2. Check Sudden Acceleration (+ve G-Force > threshold)
        if (gForce > accelThreshold) {
            newScore -= this.PENALTY_ACCEL;
            violations.push('Sudden Acceleration');
            console.log(`⚠️ Violation [${busId}]: Sudden Accel (${gForce.toFixed(3)}g > ${accelThreshold}g)`);
        }

        // 3. Check Harsh Braking (-ve G-Force < -threshold)
        if (gForce < -brakeThreshold) {
            newScore -= this.PENALTY_BRAKING;
            violations.push('Harsh Braking');
            console.log(`⚠️ Violation [${busId}]: Harsh Braking (${gForce.toFixed(3)}g < -${brakeThreshold}g)`);
        }

        // Clamp Score
        newScore = Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, newScore));

        // Update State
        state.score = newScore;
        state.lastSpeed = currentSpeed;
        state.lastTimestamp = timestamp;
        state.lastTimestampMs = timestampMs || (timestamp * 1000);

        // Keep last 5 violations for history if needed
        if (violations.length > 0) {
            state.violations.push(...violations);
            if (state.violations.length > 5) state.violations.shift();
        }

        return {
            score: newScore,
            violations: violations
        };
    }
}

// Singleton instance
const safetyService = new SafetyService();
module.exports = safetyService;
