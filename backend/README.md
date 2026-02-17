# TrackNGo Backend - Real-Time Bus Tracking System

## Overview

This is the backend service for TrackNGo, a district-level secure bus tracking system for the Thanjavur region. The backend handles GPS data from buses, calculates ETAs, and provides real-time updates to connected frontend clients via WebSocket connections.

## 🏗️ Architecture

### Technology Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework for REST APIs
- **WebSocket (ws)** - Real-time communication
- **In-Memory Storage** - Fast data access (easily migrated to MongoDB/Redis)
- **Haversine Formula** - Distance and ETA calculations

### Key Components

```
backend/
├── src/
│   ├── server.js              # Main server entry point
│   ├── app.js                 # Express application setup
│   ├── routes/                # API endpoints
│   │   ├── gps.routes.js      # GPS update handling
│   │   └── bus.routes.js      # Bus and route data APIs
│   ├── services/              # Core business logic
│   │   ├── storage.service.js  # In-memory data storage
│   │   ├── websocket.service.js # Real-time WebSocket handling
│   │   └── eta.service.js     # ETA calculations
│   ├── data/
│   │   └── routes.data.js     # Thanjavur region route data
│   └── utils/
│       ├── validation.js      # GPS data validation
│       └── logger.js          # Structured logging
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   - Open http://localhost:8080 in your browser
   - You should see the API information page
   - Health check: http://localhost:8080/health

## 📡 API Endpoints

### GPS Data Collection

#### POST /api/gps/update
Receives GPS updates from buses and broadcasts to WebSocket clients.

**Request:**
```json
{
  "bus_id": "TN-THJ-23",
  "lat": 10.7869,
  "lng": 79.1378,
  "speed": 34,
  "route_id": "R12",
  "timestamp": 1700000000
}
```

**Response:**
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

**Validation Rules:**
- `bus_id`: Required, format TN-THJ-XX
- `lat`: Required, -90 to 90
- `lng`: Required, -180 to 180
- `speed`: Optional, ≥ 0 km/h
- `route_id`: Optional, format RXX
- `timestamp`: Optional, Unix timestamp

### Bus Data APIs

#### GET /api/buses
Get all active buses with current locations.

**Query Parameters:**
- `route_id` - Filter by specific route
- `format` - Response format ('simple' | 'detailed')

**Response:**
```json
{
  "buses": [
    {
      "bus_id": "TN-THJ-23",
      "lat": 10.7869,
      "lng": 79.1378,
      "speed": 34,
      "eta": "5 mins",
      "route_id": "R12",
      "next_stop": "Medical College",
      "last_update": "2024-01-15T10:30:00.000Z",
      "timestamp": 1700000000
    }
  ],
  "total": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/buses/:busId
Get specific bus information.

#### GET /api/routes
Get all available routes with coordinates and stops.

**Query Parameters:**
- `active_only` - Return only active routes (default: true)
- `include_stops` - Include bus stops (default: true)

#### GET /api/routes/:routeId
Get specific route details including active buses.

#### GET /api/stops
Get all bus stops in the Thanjavur region.

#### GET /api/stats
Get system statistics and performance metrics.

## 📡 WebSocket API

### Connection
Connect to `ws://localhost:8080/ws/live` for real-time updates.

### Message Types

#### Server → Client Messages

**Connection Established:**
```json
{
  "type": "CONNECTION_ESTABLISHED",
  "data": {
    "clientId": "client_abc123",
    "serverTime": "2024-01-15T10:30:00.000Z",
    "region": "Thanjavur",
    "message": "Connected to TrackNGo real-time bus tracking"
  }
}
```

**Bus Update:**
```json
{
  "type": "BUS_UPDATE",
  "data": {
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 34,
    "eta": "5 mins",
    "route_id": "R12",
    "timestamp": 1700000000,
    "lastUpdate": "2024-01-15T10:30:00.000Z"
  },
  "serverTime": "2024-01-15T10:30:00.000Z"
}
```

**Current Bus Data:**
```json
{
  "type": "CURRENT_BUS_DATA",
  "data": {
    "buses": [...],
    "total": 5,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Client → Server Messages

**Request Current Data:**
```json
{
  "type": "REQUEST_CURRENT_DATA"
}
```

**Heartbeat:**
```json
{
  "type": "HEARTBEAT"
}
```

**Route Subscription:**
```json
{
  "type": "SUBSCRIBE_ROUTE",
  "data": {
    "routes": ["R12", "R15"]
  }
}
```

## 🧮 ETA Calculation

The backend calculates ETA using a sophisticated algorithm:

1. **Route Position Detection**: Finds bus position on predefined route
2. **Next Stop Identification**: Determines the next scheduled stop
3. **Distance Calculation**: Uses Haversine formula for accurate distances
4. **Speed Analysis**: Considers current speed vs. route average
5. **Time Estimation**: Calculates realistic arrival times

### ETA Formula
```
ETA = Distance to Next Stop / Effective Speed
```

Where:
- Distance calculated via Haversine formula
- Effective Speed = Current Speed (if reasonable) OR Route Average Speed
- Minimum speed of 15 km/h assumed for traffic conditions

## 🗺️ Route Data

### Predefined Routes

1. **R12 - Thanjavur → Kumbakonam Express**
   - Distance: 38.5 km
   - Average Speed: 35 km/h
   - Stops: 10 major stops

2. **R15 - Thanjavur → Trichy Highway**
   - Distance: 52.3 km
   - Average Speed: 45 km/h
   - Stops: 9 highway stops

3. **R08 - Thanjavur → Mayiladuthurai Coastal**
   - Distance: 42.8 km
   - Average Speed: 38 km/h
   - Stops: 9 coastal stops

### Route Data Format
Each route includes:
- Coordinates for path drawing
- Bus stops with distances
- Speed averages
- Route metadata

## 💾 Data Storage

### In-Memory Storage Strategy

**Why In-Memory?**
- **Performance**: O(1) lookups for real-time data
- **Simplicity**: No database setup required
- **Academic Friendly**: Works out of the box
- **Migration Ready**: Easy to switch to Redis/MongoDB

**Data Structures:**
```javascript
buses: Map<string, BusData>           // bus_id → bus information
busConnections: Map<string, Meta>     // bus_id → connection metadata
```

**Automatic Cleanup:**
- Removes stale buses (no updates > 30 seconds)
- Memory usage monitoring
- Performance statistics

### Migration to Persistent Storage

To migrate to MongoDB later:
```javascript
// Current: storage.service.js
const result = storage.updateBusLocation(busData);

// Future: mongo.service.js
const result = await mongoStorage.updateBusLocation(busData);
```

No API or WebSocket changes required!

## 🔒 Security Considerations

### Current Implementation
- **CORS Protection**: Configured for frontend domains
- **Rate Limiting**: 60 GPS updates per minute per IP
- **Input Validation**: Comprehensive GPS data validation
- **No Raw GPS Exposure**: Data filtered and validated
- **Connection Limits**: WebSocket connection management

### Encryption Ready Architecture

The system is designed for easy encryption addition:

```javascript
// Current data flow:
GPS Device → HTTP POST → Validation → Storage → WebSocket

// Future encrypted flow:
GPS Device → HTTP POST → Decryption → Validation → Storage → Encryption → WebSocket
```

**Migration Points:**
1. Add middleware in `gps.routes.js` for decryption
2. Add middleware in `websocket.service.js` for encryption
3. No changes to validation or storage layers

### Security Headers
- Helmet.js for security headers
- CORS configuration
- No sensitive data in logs

## 📊 Monitoring & Logging

### Structured Logging
```javascript
// GPS Updates
logger.gpsUpdate(busId, lat, lng, speed, routeId, processingTime);

// WebSocket Events
logger.wsConnection('connected', clientId, details);

// API Requests
logger.apiRequest(method, path, statusCode, responseTime, clientIp);

// Security Events
logger.security('rate_limit_exceeded', { client_id: clientId });
```

### Performance Metrics
- GPS update processing time
- WebSocket connection counts
- Memory usage tracking
- API response times

### Log Files
```
logs/
├── trackngo-info.log    # General information
├── trackngo-warn.log    # Warnings and issues
├── trackngo-error.log   # Errors and exceptions
└── trackngo-debug.log   # Detailed debugging
```

## 🧪 Testing & Development

### Development Endpoints

**Mock GPS Data (Development Only):**
```bash
POST /api/gps/test
{
  "bus_id": "TN-THJ-99",
  "lat": 10.7869,
  "lng": 79.1378
}
```

**System Statistics:**
```bash
GET /api/stats
```

**GPS Processing Stats:**
```bash
GET /api/gps/stats
```

### Testing GPS Updates

```bash
# Send test GPS update
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

### WebSocket Testing

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/live');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'REQUEST_CURRENT_DATA'
  }));
};
```

## 🚀 Production Deployment

### Environment Configuration

```bash
# Production .env
NODE_ENV=production
PORT=8080
LOG_LEVEL=warn
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
MAX_GPS_AGE_SECONDS=30
MAX_SPEED_KMH=120
```

### Process Management

```bash
# Using PM2
npm install -g pm2
pm2 start src/server.js --name "trackngo-backend"
pm2 save
pm2 startup
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.trackngo.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket specific
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Health Checks

```bash
# Kubernetes health check
GET /health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "TrackNGo Backend",
  "region": "Thanjavur",
  "version": "1.0.0"
}
```

## 🔧 Troubleshooting

### Common Issues

#### GPS Updates Not Processing
```bash
# Check if server is running
curl http://localhost:8080/health

# Check GPS endpoint
curl -X POST http://localhost:8080/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{"bus_id":"TN-THJ-99","lat":10.7869,"lng":79.1378}'
```

#### WebSocket Connection Failed
1. Check if port 8080 is open
2. Verify CORS settings in .env
3. Check browser network tab for WebSocket errors

#### Memory Issues
```bash
# Check memory usage
GET /api/stats

# Monitor logs
tail -f logs/trackngo-info.log
```

### Debug Mode
```bash
# Set debug logging
LOG_LEVEL=debug npm start

# View debug logs
tail -f logs/trackngo-debug.log
```

## 📚 Academic Context

### Learning Objectives
- Real-time data processing
- WebSocket communication
- GPS coordinate mathematics
- In-memory data structures
- API design principles
- Security considerations

### Extensibility
- Easy migration to other districts
- Scalable architecture patterns
- Microservices ready
- Database abstraction layer

### Code Quality
- Comprehensive error handling
- Structured logging
- Input validation
- Security best practices
- Performance optimization

## 🤝 API Integration Examples

### Frontend Integration
```javascript
// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:8080/ws/live');

// Handle bus updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'BUS_UPDATE') {
    updateBusOnMap(message.data);
  }
};

// Send GPS update from bus device
const sendGPSUpdate = async (busData) => {
  const response = await fetch('/api/gps/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(busData)
  });
  return response.json();
};
```

### Mobile App Integration
```javascript
// Get nearby buses
const getNearbyBuses = async (lat, lng, radiusKm = 5) => {
  const buses = await fetch('/api/buses').then(r => r.json());
  return buses.buses.filter(bus => {
    const distance = calculateDistance(lat, lng, bus.lat, bus.lng);
    return distance <= radiusKm;
  });
};
```

## 📄 License

This project is developed for academic purposes as part of the TrackNGo bus tracking system for Thanjavur region.

---

**TrackNGo Backend** - Secure, Real-time, Scalable Bus Tracking for Thanjavur Region