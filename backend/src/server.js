require('dotenv').config();
const http = require('http');
const app = require('./app');
const WebSocketService = require('./services/websocket.service');

// Configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed');

    // Close WebSocket connections
    webSocketService.shutdown();
    console.log('WebSocket connections closed');

    // Exit process
    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force exit after 30 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
server.listen(PORT, () => {
  console.log(`
╭─────────────────────────────────────────╮
│           TrackNGo Backend              │
│     Secure Bus Tracking - Thanjavur    │
╰─────────────────────────────────────────╯

🚀 Server running on port ${PORT}
🌍 Environment: ${NODE_ENV}
🗺️  Region: ${process.env.REGION || 'Thanjavur'}
🔗 Health check: http://localhost:${PORT}/health
📡 WebSocket: ws://localhost:${PORT}${process.env.WS_PATH || '/ws/live'}

📋 API Endpoints:
   POST /api/gps/update     - Receive GPS updates from buses
   GET  /api/buses          - Get active buses
   GET  /api/routes         - Get route data
   GET  /health             - Health check

🎮 TERMINAL CONTROLS:
   Type commands below to control simulation:
   > toggle <BusID>  (e.g., 'toggle N1631') - Start/Stop bus
   > list            - Show active simulated buses
   > help            - Show commands
   > exit            - detailed shutdown
  `);

  // Terminal Input Handler for Simulation Control
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'TrackNGo> '
  });

  rl.prompt();

  rl.on('line', (line) => {
    const args = line.trim().split(' ');
    const cmd = args[0].toLowerCase();
    const arg = args[1]?.toUpperCase(); // Bus IDs are usually uppercase

    switch (cmd) {
      case 'toggle':
        if (!arg) {
          console.log('Usage: toggle <BusID>');
        } else {
          webSocketService.toggleBusSimulation(arg);
        }
        break;

      case 'list':
      case 'status':
        if (webSocketService.simulatedBuses) {
          console.log('🚌 Active Simulated Buses:', Array.from(webSocketService.simulatedBuses).join(', '));
        } else {
          console.log('Simulation not initialized yet.');
        }
        break;

      case 'help':
        console.log(`
        Commands:
        - toggle <BusID> : Turn simulation on/off for a bus (N1631, N1600, N1602, N0760)
        - list           : List currently running buses
        - exit           : Stop server
        `);
        break;

      case 'exit':
      case 'quit':
        gracefulShutdown('USER_REQUEST');
        break;

      case '':
        break;

      default:
        console.log(`Unknown command: '${cmd}'. Type 'help' for options.`);
        break;
    }
    rl.prompt();
  });
});

// Export server for testing
module.exports = server;