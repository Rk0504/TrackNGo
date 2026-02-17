const axios = require('axios');
const { ROUTES } = require('./routes');

// --- CONFIGURATION ---
const API_URL = process.env.API_URL || 'http://localhost:8080/api/gps/update';
const UPDATE_INTERVAL_MS = 4000; // 4 seconds (within 3-5s request)

// Bus Configuration - Easily extensible
const BUSES = [
    { bus_id: 'TN-THJ-23', route_id: 'R12', speed_base: 35 },
    { bus_id: 'TN-THJ-45', route_id: 'R08', speed_base: 40 },
    { bus_id: 'TN-THJ-77', route_id: 'R15', speed_base: 45 }
];

// Initialize internal state for each bus
const busStates = BUSES.map(bus => {
    if (!ROUTES[bus.route_id]) {
        console.error(`Error: Route ${bus.route_id} not found for bus ${bus.bus_id}`);
        process.exit(1);
    }
    return {
        ...bus,
        currentIndex: 0,
        route: ROUTES[bus.route_id]
    };
});

console.log('------------------------------------------------');
console.log('🚀 TrackNGo GPS Simulator Started');
console.log(`📡 Backend Endpoint: ${API_URL}`);
console.log(`⏱️  Update Interval: ${UPDATE_INTERVAL_MS}ms`);
console.log(`🚌 Active Buses: ${BUSES.length}`);
console.log('------------------------------------------------');

// --- SIMULATION LOOP ---
setInterval(async () => {
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp

    // Process each bus
    for (const bus of busStates) {
        moveBus(bus);

        const currentPoint = bus.route[bus.currentIndex];

        // Randomize speed slightly (+/- 5 km/h)
        const currentSpeed = bus.speed_base + (Math.random() * 10 - 5);

        const payload = {
            bus_id: bus.bus_id,
            lat: currentPoint.lat,
            lng: currentPoint.lng,
            speed: parseFloat(currentSpeed.toFixed(1)),
            route_id: bus.route_id,
            timestamp: timestamp
        };

        try {
            await axios.post(API_URL, payload);
            console.log(`[${new Date().toLocaleTimeString()}] ✅ Sent ${bus.bus_id} @ [${payload.lat}, ${payload.lng}]`);
        } catch (error) {
            console.error(`[${new Date().toLocaleTimeString()}] ❌ Failed ${bus.bus_id}: ${error.message}`);
            if (error.response) {
                console.error(`   Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            // Do not crash, just log and continue
        }
    }

}, UPDATE_INTERVAL_MS);


// --- HELPER FUNCTIONS ---

function moveBus(bus) {
    // Determine next index
    let nextIndex = bus.currentIndex + 1;

    // Loop back to start if end of route reached
    if (nextIndex >= bus.route.length) {
        nextIndex = 0;
        console.log(`🔄 ${bus.bus_id} finished route, looping back to start.`);
    }

    bus.currentIndex = nextIndex;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping GPS Simulator...');
    process.exit(0);
});
