const WebSocket = require('ws');
const url = require('url');

/**
 * WebSocket Service for Real-Time Bus Tracking
 * 
 * Handles WebSocket connections from frontend clients and broadcasts
 * real-time bus location updates. Designed to support end-to-end
 * encryption later without changing the core structure.
 * 
 * Features:
 * - Client connection management
 * - Real-time bus update broadcasting
 * - Connection cleanup and error handling
 * - Heartbeat/ping-pong for connection health
 * - Statistics tracking
 */

class WebSocketService {
  constructor(server) {
    this.server = server;
    this.wss = null;
    this.clients = new Map(); // clientId -> { ws, metadata }
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      startTime: new Date()
    };

    // Initialize WebSocket server
    this.initialize();

    // Singleton reference
    WebSocketService.instance = this;
  }

  /**
   * Initialize WebSocket server
   */
  initialize() {
    const wsPath = process.env.WS_PATH || '/ws/live';

    // Create WebSocket server attached to HTTP server
    this.wss = new WebSocket.Server({
      server: this.server,
      path: wsPath,
      verifyClient: this.verifyClient.bind(this)
    });

    // Handle new connections
    this.wss.on('connection', this.handleConnection.bind(this));

    // Server-level error handling
    this.wss.on('error', (error) => {
      console.error('❌ WebSocket Server Error:', error);
    });

    console.log(`📡 WebSocket server initialized on path ${wsPath}`);

    // Start heartbeat interval
    this.startHeartbeat();
  }


  /**
  /**

    // Simulation Data
    this.ROUTE_DATA = {
      'N1631': { // New Bus Stand -> Old Bus Stand (20 mins)
        id: 'N1631',
        name: 'NBS to OBS',
        stops: [
          { name: 'NBS', lat: 10.750134, lng: 79.112540, time: 0 },
          { name: 'RR Nagar', lat: 10.748987, lng: 79.116859, time: 3 },
          { name: 'Co Optex', lat: 10.750962, lng: 79.118756, time: 3.5 },
          { name: 'Cauvery nagar', lat: 10.754532, lng: 79.121857, time: 4 },
          { name: 'Kulantha yesu kovil', lat: 10.758390, lng: 79.125537, time: 5 },
          { name: 'Old housing unit', lat: 10.762322, lng: 79.127786, time: 6 },
          { name: 'Rohini hospital', lat: 10.769091, lng: 79.130906, time: 8 },
          { name: 'Ramanathan (or) Manimandabam', lat: 10.772036, lng: 79.132249, time: 9 },
          { name: 'Philomena mall', lat: 10.773967, lng: 79.136012, time: 10 },
          { name: 'Sacrad heart school', lat: 10.775284, lng: 79.138983, time: 11.5 },
          { name: 'Vasanth and co', lat: 10.775788, lng: 79.140343, time: 12 },
          { name: 'Junction front Side', lat: 10.778700, lng: 79.140033, time: 16 },
          { name: 'Municipal cooperation', lat: 10.782027, lng: 79.139417, time: 17 },
          { name: 'OBS', lat: 10.786710, lng: 79.137204, time: 20 }
        ]
      },
      'N1600': { // Old Bus Stand -> New Bus Stand (20 mins)
        id: 'N1600',
        name: 'OBS to NBS',
        stops: [
          { name: 'OBS', lat: 10.787069, lng: 79.138296, time: 0 },
          { name: 'Municipal cooperation', lat: 10.782027, lng: 79.139417, time: 3 },
          { name: 'Junction front Side', lat: 10.778700, lng: 79.140033, time: 4 },
          { name: 'Vasanth and co', lat: 10.775788, lng: 79.140343, time: 8 },
          { name: 'Sacrad heart school', lat: 10.775284, lng: 79.138983, time: 8.5 },
          { name: 'Philomena mall', lat: 10.773967, lng: 79.136012, time: 10 },
          { name: 'Ramanathan (or) Manimandabam', lat: 10.772036, lng: 79.132249, time: 11 },
          { name: 'Rohini hospital', lat: 10.769091, lng: 79.130906, time: 12 },
          { name: 'Old housing unit', lat: 10.762322, lng: 79.127786, time: 14 },
          { name: 'Kulantha yesu kovil', lat: 10.758390, lng: 79.125537, time: 15 },
          { name: 'Cauvery nagar', lat: 10.754532, lng: 79.121857, time: 16 },
          { name: 'Co Optex', lat: 10.750962, lng: 79.118756, time: 16.5 },
          { name: 'RR Nagar', lat: 10.748987, lng: 79.116859, time: 17 },
          { name: 'NBS', lat: 10.749642, lng: 79.113141, time: 20 }
        ]
      },
      'N1602': { // Old Bus Stand -> Medical 4th gate (18 mins)
        id: 'N1602',
        name: 'OBS to Medical College',
        stops: [
          { name: 'OBS', lat: 10.787084, lng: 79.138255, time: 0 },
          { name: 'Rajali birds park', lat: 10.781550, lng: 79.133692, time: 3 },
          { name: 'Membalam', lat: 10.777714, lng: 79.129890, time: 5 },
          { name: 'Sathya stadium', lat: 10.776450, lng: 79.127916, time: 6 },
          { name: 'Rajappa nagar (or) SB hospital', lat: 10.775525, lng: 79.124811, time: 7 },
          { name: 'jaya shakthi snacks (or) Balaji nagar', lat: 10.774592, lng: 79.122603, time: 8 },
          { name: 'Lakshmi seeval', lat: 10.772976, lng: 79.118959, time: 9 },
          { name: 'ifb point (or) Sundaram nagar', lat: 10.770455, lng: 79.114492, time: 10 },
          { name: 'Municipal colony (or) nav barath school', lat: 10.768262, lng: 79.111407, time: 12 },
          { name: 'Eswari nagar (or) Trends', lat: 10.766387, lng: 79.109129, time: 13 },
          { name: 'Medical 1st gate', lat: 10.763167, lng: 79.106637, time: 14 },
          { name: 'Medical 2nd gate', lat: 10.761365, lng: 79.104906, time: 15 },
          { name: 'Medical 3rd gate', lat: 10.760519, lng: 79.103878, time: 16 },
          { name: 'Medical 4th gate', lat: 10.759973, lng: 79.103198, time: 17 }
        ]
      },
      'N0760': { // Medical 4th gate -> Old Bus Stand (17 mins)
        id: 'N0760',
        name: 'Medical College to OBS',
        stops: [
          { name: 'Medical 4th gate', lat: 10.759963, lng: 79.102987, time: 0 },
          { name: 'Medical 3rd gate', lat: 10.760429, lng: 79.103657, time: 1 },
          { name: 'Medical 2nd gate', lat: 10.761365, lng: 79.104686, time: 1.5 },
          { name: 'Medical 1st gate', lat: 10.763158, lng: 79.106500, time: 2 },
          { name: 'Eswari nagar', lat: 10.766959, lng: 79.109608, time: 4 },
          { name: 'Municipal colony', lat: 10.768351, lng: 79.111474, time: 5 },
          { name: 'ifb point (or) Sundaram nagar', lat: 10.770485, lng: 79.114453, time: 6 },
          { name: 'Lakshmi seeval', lat: 10.772878, lng: 79.118467, time: 7 },
          { name: 'jaya shakthi snacks (or) Balaji nagar', lat: 10.774571, lng: 79.122314, time: 9 },
          { name: 'Sathya stadium', lat: 10.776347, lng: 79.127504, time: 11 },
          { name: 'Membalam', lat: 10.778323, lng: 79.129987, time: 12 },
          { name: 'Rajali birds park', lat: 10.781828, lng: 79.133871, time: 13 },
          { name: 'Central library', lat: 10.785430, lng: 79.133732, time: 15 },
          { name: 'OBS', lat: 10.786708, lng: 79.137452, time: 17 }
        ]
      }
    };

    // Active Simulated Buses (Toggle these to on/off)
    this.simulatedBuses = new Set(['N1631', 'N1600', 'N1602', 'N0760']);
    this.simulationLoopDuration = 20 * 60 * 1000; // 20 minutes

    // Start Loop
    this.simInterval = setInterval(() => {
      const now = Date.now();
      const timeInLoop = now % this.simulationLoopDuration;

      this.simulatedBuses.forEach(busId => {
        const route = this.ROUTE_DATA[busId];
        if (route) {
          const busState = this.calculateBusState(route, timeInLoop);

          // Construct message matching BUS_UPDATE format
          const updateMessage = {
            data: {
              bus_id: busState.bus_id,
              lat: busState.lat,
              lng: busState.lng,
              speed: busState.speed,
              heading: busState.heading,
              next_stop: busState.next_stop,
              eta: busState.eta,
              timestamp: new Date().toISOString(),
              lastUpdate: new Date().toISOString(),
              status: busState.status,
              stops: busState.stops,
              currentStopIndex: busState.currentStopIndex,
              route_name: busState.route_name,
              safety_score: busState.safety_score
            }
          };

          this.broadcastBusUpdate(updateMessage);
        }
      });

    }, 1000); // Update every second
  }

  calculateBusState(route, timeInLoopMs) {
    const timeInMinutes = timeInLoopMs / 60000;
    const stops = route.stops;

    // Find current segment
    let currentStopIndex = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      if (timeInMinutes >= stops[i].time && timeInMinutes < stops[i + 1].time) {
        currentStopIndex = i;
        break;
      }
    }

    // Handle wrap-around logic (stay at end or loop)
    // For this loop simulation, we assume they restart, but let's clamp for safety if time > last stop
    if (timeInMinutes >= stops[stops.length - 1].time) {
      currentStopIndex = stops.length - 1;
    }

    const currentStop = stops[currentStopIndex];
    const nextStop = stops[currentStopIndex + 1] || stops[0]; // Loop to start

    let lat = currentStop.lat;
    let lng = currentStop.lng;
    let heading = 0;
    let speed = 0;

    // Interpolate if moving between stops
    if (nextStop && currentStop !== nextStop && timeInMinutes < stops[stops.length - 1].time) {
      const timeDiff = nextStop.time - currentStop.time;
      // avoid divide by zero
      if (timeDiff > 0) {
        const progress = (timeInMinutes - currentStop.time) / timeDiff;

        // Linear interpolation
        lat = currentStop.lat + (nextStop.lat - currentStop.lat) * progress;
        lng = currentStop.lng + (nextStop.lng - currentStop.lng) * progress;

        // Calculate Heading
        const dy = nextStop.lat - currentStop.lat;
        const dx = Math.cos(Math.PI / 180 * currentStop.lat) * (nextStop.lng - currentStop.lng);
        heading = Math.atan2(dy, dx) * 180 / Math.PI;

        // Calculate Speed (approx km/h) based on distance/time - just randomizing for "realism"
        speed = 30 + Math.random() * 10;
      }
    }

    // Determine Status
    let status = 'moving';
    if (speed < 5) status = 'stopped';

    return {
      bus_id: route.id,
      route_name: route.name,
      lat: lat,
      lng: lng,
      speed: speed,
      heading: heading,
      next_stop: nextStop.name,
      eta: `${Math.max(0, Math.ceil(nextStop.time - timeInMinutes))} mins`,
      safety_score: 98,
      status: status,
      stops: route.stops,
      currentStopIndex: currentStopIndex
    };
  }

  toggleBusSimulation(busId) {
    if (this.simulatedBuses.has(busId)) {
      this.simulatedBuses.delete(busId);
      console.log(`❌ Simulation PAUSED for ${busId}`);
      return false; // stopped
    } else if (this.ROUTE_DATA[busId]) {
      this.simulatedBuses.add(busId);
      console.log(`✅ Simulation STARTED for ${busId}`);
      return true; // started
    } else {
      console.log(`⚠️  Bus ID ${busId} not found in simulation data.`);
      return null; // not found
    }
  }
  // SIMULATION LOGIC END

  /**
   * Verify client before allowing connection
   */
  verifyClient(info) {
    // For future: Add authentication/authorization here
    // For now: Allow all connections from allowed origins

    const origin = info.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

    // For development, allow all connections (simplifies mobile testing)
    const allowAll = true;

    if (allowAll || !origin || allowedOrigins.includes(origin)) {
      return true;
    }

    console.log(`🚫 WebSocket connection rejected from origin: ${origin}`);
    return true; // FORCE ALLOW ALL for now to fix user issue
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const clientIp = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const connectTime = new Date();

    // Store client information
    const clientInfo = {
      ws,
      id: clientId,
      ip: clientIp,
      userAgent,
      connectTime,
      lastPing: new Date(),
      isAlive: true
    };

    this.clients.set(clientId, clientInfo);

    // Update statistics
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    console.log(`🔗 WebSocket client connected: ${clientId} from ${clientIp}`);
    console.log(`📊 Active connections: ${this.stats.activeConnections}`);

    // Set up message handlers
    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', (code, reason) => this.handleDisconnection(clientId, code, reason));
    ws.on('error', (error) => this.handleClientError(clientId, error));
    ws.on('pong', () => this.handlePong(clientId));

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'CONNECTION_ESTABLISHED',
      data: {
        clientId,
        serverTime: new Date().toISOString(),
        region: process.env.REGION || 'Thanjavur',
        message: 'Connected to TrackNGo real-time bus tracking'
      }
    });

    // Send current bus data immediately
    this.sendCurrentBusData(clientId);
  }

  /**
   * Handle incoming messages from clients
   */
  handleMessage(clientId, data) {
    try {
      this.stats.messagesReceived++;

      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.log(`⚠️  Message from unknown client: ${clientId}`);
        return;
      }

      console.log(`📨 Message from ${clientId}:`, message.type);

      // Handle different message types
      switch (message.type) {
        case 'PING':
          this.sendToClient(clientId, { type: 'PONG', timestamp: new Date().toISOString() });
          break;

        case 'REQUEST_CURRENT_DATA':
          this.sendCurrentBusData(clientId);
          break;

        case 'SUBSCRIBE_ROUTE':
          this.handleRouteSubscription(clientId, message.data);
          break;

        case 'HEARTBEAT':
          client.lastPing = new Date();
          break;

        default:
          console.log(`⚠️  Unknown message type from ${clientId}: ${message.type}`);
      }

    } catch (error) {
      console.error(`❌ Error processing message from ${clientId}:`, error.message);
      this.sendToClient(clientId, {
        type: 'ERROR',
        data: { message: 'Invalid message format' }
      });
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(clientId, code, reason) {
    const client = this.clients.get(clientId);

    if (client) {
      const connectionDuration = Date.now() - client.connectTime;
      console.log(`🔌 Client disconnected: ${clientId} (${connectionDuration}ms connected)`);

      this.clients.delete(clientId);
      this.stats.activeConnections--;

      console.log(`📊 Active connections: ${this.stats.activeConnections}`);
    }
  }

  /**
   * Handle client errors
   */
  handleClientError(clientId, error) {
    console.error(`❌ WebSocket client error ${clientId}:`, error.message);

    // Remove problematic client
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.terminate();
      this.clients.delete(clientId);
      this.stats.activeConnections--;
    }
  }

  /**
   * Handle pong response from client
   */
  handlePong(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = true;
      client.lastPing = new Date();
    }
  }

  /**
   * Broadcast bus update to all connected clients
   */
  broadcastBusUpdate(message) {
    if (!message || !message.data) {
      console.error('❌ Invalid broadcast message format');
      return;
    }

    const broadcastData = {
      type: 'BUS_UPDATE',
      data: {
        bus_id: message.data.bus_id,
        lat: message.data.lat,
        lng: message.data.lng,
        speed: message.data.speed || 0,
        eta: message.data.eta || null,
        route_id: message.data.route_id || null,
        safety_score: message.data.safety_score, // Added safety_score
        violations: message.data.violations || [], // Added violations
        status: message.data.status, // Added status
        timestamp: message.data.timestamp,
        lastUpdate: message.data.lastUpdate
      },
      serverTime: new Date().toISOString()
    };

    this.broadcast(broadcastData);

    console.log(`📡 Broadcasted update for bus ${message.data.bus_id} to ${this.stats.activeConnections} clients`);
  }

  /**
   * Send message to all connected clients
   */
  broadcast(message) {
    let successCount = 0;
    let failureCount = 0;

    this.clients.forEach((client, clientId) => {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
          successCount++;
          this.stats.messagesSent++;
        } else {
          // Clean up dead connections
          this.clients.delete(clientId);
          this.stats.activeConnections--;
          failureCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to send to client ${clientId}:`, error.message);
        failureCount++;

        // Remove failed client
        this.clients.delete(clientId);
        this.stats.activeConnections--;
      }
    });

    if (failureCount > 0) {
      console.log(`⚠️  Broadcast completed: ${successCount} success, ${failureCount} failures`);
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);

    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      console.log(`⚠️  Cannot send to client ${clientId}: not connected`);
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      return true;
    } catch (error) {
      console.error(`❌ Failed to send to client ${clientId}:`, error.message);
      return false;
    }
  }

  /**
   * Send current bus data to specific client
   */
  sendCurrentBusData(clientId) {
    try {
      const { getInstance: getStorage } = require('./storage.service');
      const storage = getStorage();
      const buses = storage.getAllActiveBuses();

      this.sendToClient(clientId, {
        type: 'CURRENT_BUS_DATA',
        data: {
          buses: buses,
          total: buses.length,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`📋 Sent current bus data (${buses.length} buses) to client ${clientId}`);
    } catch (error) {
      console.error(`❌ Failed to send current bus data to ${clientId}:`, error.message);
    }
  }

  /**
   * Handle route subscription (for future filtering)
   */
  handleRouteSubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Store subscription preference
    client.subscribedRoutes = data.routes || [];

    console.log(`🎯 Client ${clientId} subscribed to routes:`, client.subscribedRoutes);

    this.sendToClient(clientId, {
      type: 'SUBSCRIPTION_CONFIRMED',
      data: {
        subscribedRoutes: client.subscribedRoutes,
        message: 'Route subscription updated'
      }
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  startHeartbeat() {
    const interval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`💀 Terminating dead connection: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          this.stats.activeConnections--;
          return;
        }

        // Mark as potentially dead, will be revived by pong
        client.isAlive = false;

        try {
          client.ws.ping();
        } catch (error) {
          console.log(`⚠️  Failed to ping client ${clientId}`);
          this.clients.delete(clientId);
          this.stats.activeConnections--;
        }
      });
    }, 30000); // 30 seconds

    console.log('💓 WebSocket heartbeat started (30s interval)');

    // Store interval for cleanup
    this.heartbeatInterval = interval;
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `client_${timestamp}_${random}`;
  }

  /**
   * Get WebSocket statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;

    return {
      ...this.stats,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      clientsInfo: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        ip: client.ip,
        connectTime: client.connectTime,
        lastPing: client.lastPing,
        subscribedRoutes: client.subscribedRoutes || []
      }))
    };
  }

  /**
   * Format uptime in human readable format
   */
  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Shutdown WebSocket server gracefully
   */
  shutdown() {
    console.log('🛑 Shutting down WebSocket server...');

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all client connections
    this.clients.forEach((client, clientId) => {
      try {
        client.ws.send(JSON.stringify({
          type: 'SERVER_SHUTDOWN',
          data: { message: 'Server is shutting down' }
        }));
        client.ws.close(1001, 'Server shutdown');
      } catch (error) {
        client.ws.terminate();
      }
    });

    // Close WebSocket server
    if (this.wss) {
      this.wss.close(() => {
        console.log('✅ WebSocket server closed');
      });
    }

    this.clients.clear();
    this.stats.activeConnections = 0;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    return WebSocketService.instance || null;
  }
}

module.exports = WebSocketService;