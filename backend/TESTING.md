# TrackNGo Backend Testing Guide

## Quick Testing Setup

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

Server should start on http://localhost:8080

### 2. Verify Server is Running

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "TrackNGo Backend",
  "region": "Thanjavur",
  "version": "1.0.0"
}
```

## Testing GPS Updates

### Basic GPS Update

```bash
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 35,
    "route_id": "R12"
  }'
```

Expected response:
```json
{
  "message": "GPS update processed successfully",
  "bus_id": "TN-THJ-23",
  "timestamp": 1700000000,
  "eta": "5 mins",
  "nextStop": "Medical College",
  "processingTime": "15ms"
}
```

### Multiple Bus Updates

```bash
# Bus 1 on Route R12
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 35,
    "route_id": "R12"
  }'

# Bus 2 on Route R15
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-45",
    "lat": 10.7890,
    "lng": 79.1350,
    "speed": 42,
    "route_id": "R15"
  }'

# Bus 3 on Route R08
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-67",
    "lat": 10.7920,
    "lng": 79.1450,
    "speed": 28,
    "route_id": "R08"
  }'
```

## Testing REST APIs

### Get All Active Buses

```bash
curl http://localhost:8080/api/buses
```

### Get Buses by Route

```bash
curl "http://localhost:8080/api/buses?route_id=R12"
```

### Get Specific Bus

```bash
curl http://localhost:8080/api/buses/TN-THJ-23
```

### Get All Routes

```bash
curl http://localhost:8080/api/routes
```

### Get Specific Route

```bash
curl http://localhost:8080/api/routes/R12
```

### Get Bus Stops

```bash
curl http://localhost:8080/api/stops
```

### Get System Statistics

```bash
curl http://localhost:8080/api/stats
```

## Testing WebSocket Connection

### Using Browser Console

```javascript
// Open browser console on any webpage and run:

const ws = new WebSocket('ws://localhost:8080/ws/live');

ws.onopen = function() {
    console.log('WebSocket connected');
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};

ws.onclose = function() {
    console.log('WebSocket disconnected');
};

// Request current bus data
ws.send(JSON.stringify({
    type: 'REQUEST_CURRENT_DATA'
}));
```

### Using Node.js WebSocket Client

```javascript
// test-websocket.js
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/ws/live');

ws.on('open', function() {
    console.log('Connected to TrackNGo WebSocket');
    
    // Request current data
    ws.send(JSON.stringify({
        type: 'REQUEST_CURRENT_DATA'
    }));
});

ws.on('message', function(data) {
    const message = JSON.parse(data.toString());
    console.log('Received:', JSON.stringify(message, null, 2));
});

ws.on('close', function() {
    console.log('Disconnected from WebSocket');
});
```

Run with: `node test-websocket.js`

## Testing End-to-End Workflow

### Complete Bus Tracking Simulation

```bash
#!/bin/bash
# test-complete-flow.sh

echo "🚀 Starting TrackNGo Backend Testing"

# 1. Check server health
echo "1. Checking server health..."
curl -s http://localhost:8080/health | jq .

# 2. Send initial GPS updates
echo "2. Sending GPS updates for 3 buses..."

curl -s -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 35,
    "route_id": "R12"
  }' | jq .

curl -s -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-45",
    "lat": 10.7890,
    "lng": 79.1350,
    "speed": 42,
    "route_id": "R15"
  }' | jq .

curl -s -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-67",
    "lat": 10.7920,
    "lng": 79.1450,
    "speed": 28,
    "route_id": "R08"
  }' | jq .

# 3. Verify buses are active
echo "3. Checking active buses..."
curl -s http://localhost:8080/api/buses | jq '.buses | length'

# 4. Test route-specific queries
echo "4. Testing route R12 buses..."
curl -s "http://localhost:8080/api/buses?route_id=R12" | jq .

# 5. Get route information
echo "5. Getting route R12 details..."
curl -s http://localhost:8080/api/routes/R12 | jq .

echo "✅ Testing complete!"
```

Make executable and run:
```bash
chmod +x test-complete-flow.sh
./test-complete-flow.sh
```

## Testing Error Scenarios

### Invalid GPS Data

```bash
# Missing required fields
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23"
  }'
# Expected: 400 error

# Invalid coordinates
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23",
    "lat": 999,
    "lng": 999
  }'
# Expected: 400 error

# Invalid bus ID format
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "INVALID-BUS",
    "lat": 10.7869,
    "lng": 79.1378
  }'
# Expected: 400 error
```

### Non-existent Resources

```bash
# Non-existent bus
curl http://localhost:8080/api/buses/NON-EXISTENT
# Expected: 404

# Non-existent route
curl http://localhost:8080/api/routes/R999
# Expected: 404
```

### Rate Limiting

```bash
# Send 70 requests quickly (rate limit is 60/minute)
for i in {1..70}; do
  curl -s -X POST http://localhost:8080/api/gps/update \
    -H "Content-Type: application/json" \
    -d "{
      \"bus_id\": \"TN-THJ-99\",
      \"lat\": $((10 + RANDOM % 1)),
      \"lng\": $((79 + RANDOM % 1))
    }" &
done
wait
# Some requests should return 429 (Too Many Requests)
```

## Performance Testing

### Load Testing GPS Endpoints

```bash
# Install wrk (load testing tool)
# Ubuntu: apt-get install wrk
# macOS: brew install wrk

# Test GPS update endpoint
wrk -t12 -c400 -d30s -s gps-load-test.lua http://localhost:8080/api/gps/update
```

Create `gps-load-test.lua`:
```lua
-- gps-load-test.lua
wrk.method = "POST"
wrk.headers["Content-Type"] = "application/json"

counter = 0

request = function()
    counter = counter + 1
    local lat = 10.7869 + (counter % 100) * 0.001
    local lng = 79.1378 + (counter % 100) * 0.001
    local bus_id = "TN-THJ-" .. (23 + (counter % 10))
    
    local body = string.format([[
    {
        "bus_id": "%s",
        "lat": %f,
        "lng": %f,
        "speed": %d,
        "route_id": "R12"
    }
    ]], bus_id, lat, lng, 30 + (counter % 40))
    
    return wrk.format(nil, nil, nil, body)
end
```

### Memory Usage Monitoring

```bash
# Monitor memory while sending updates
watch -n 1 'curl -s http://localhost:8080/api/stats | jq .stats.system.memory'
```

## Testing with Frontend

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd ../frontend  # Assuming frontend is in parallel directory
npm start
```

### 3. Send Test Data
```bash
# Send some buses
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 35,
    "route_id": "R12"
  }'
```

### 4. Verify in Browser
- Open http://localhost:3000
- Go to tracking page
- Should see bus markers appearing on map
- Should see real-time updates

## Automated Testing Script

```bash
#!/bin/bash
# run-all-tests.sh

echo "🧪 TrackNGo Backend Test Suite"
echo "================================"

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0

# Test function
test_endpoint() {
    local description="$1"
    local url="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    local data="$5"
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL$url" \
                      -H "Content-Type: application/json" \
                      -d "$data" -o /dev/null)
    else
        response=$(curl -s -w "%{http_code}" "$BASE_URL$url" -o /dev/null)
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ PASS"
        ((PASS++))
    else
        echo "❌ FAIL (Expected: $expected_status, Got: $response)"
        ((FAIL++))
    fi
}

# Run tests
test_endpoint "Health check" "/health" "200"
test_endpoint "Get buses (empty)" "/api/buses" "200"
test_endpoint "Get routes" "/api/routes" "200"
test_endpoint "Get stops" "/api/stops" "200"
test_endpoint "Get stats" "/api/stats" "200"

test_endpoint "Valid GPS update" "/api/gps/update" "200" "POST" '{
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 35,
    "route_id": "R12"
}'

test_endpoint "Invalid GPS data" "/api/gps/update" "400" "POST" '{
    "bus_id": "INVALID",
    "lat": 999,
    "lng": 999
}'

test_endpoint "Get buses (should have data)" "/api/buses" "200"
test_endpoint "Get specific bus" "/api/buses/TN-THJ-23" "200"
test_endpoint "Non-existent bus" "/api/buses/NON-EXISTENT" "404"
test_endpoint "Get route R12" "/api/routes/R12" "200"
test_endpoint "Non-existent route" "/api/routes/R999" "404"

echo ""
echo "Test Results: $PASS passed, $FAIL failed"

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💥 Some tests failed!"
    exit 1
fi
```

Run with:
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

## Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm start
```

### View Logs
```bash
# Real-time log viewing
tail -f logs/trackngo-info.log

# Error logs
tail -f logs/trackngo-error.log

# Debug logs
tail -f logs/trackngo-debug.log
```

### Check Memory Usage
```bash
# System memory
free -h

# Node.js memory
curl -s http://localhost:8080/api/stats | jq .stats.system.memory
```

### Monitor WebSocket Connections
```bash
# Active connections
curl -s http://localhost:8080/api/stats | jq .stats.buses.active

# WebSocket stats  
curl -s http://localhost:8080/api/stats | jq .stats.performance
```

This testing guide covers all aspects of the TrackNGo backend functionality and should help ensure everything works correctly!