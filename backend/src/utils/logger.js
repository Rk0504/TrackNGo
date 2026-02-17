/**
 * Logging utility for TrackNGo Backend
 * 
 * Provides structured logging with different levels and formats
 * Includes GPS update logging, WebSocket connection tracking, and error handling
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logDir = path.join(process.cwd(), 'logs');
    this.maxLogFiles = 5;
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    
    // Create logs directory if it doesn't exist
    this.ensureLogDirectory();
    
    // Log levels
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Current log level number
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
    
    console.log(`📝 Logger initialized with level: ${this.logLevel}`);
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
        console.log(`📁 Created log directory: ${this.logDir}`);
      } catch (error) {
        console.error('Failed to create log directory:', error.message);
      }
    }
  }

  /**
   * Check if we should log at this level
   */
  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      pid,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to console and file
   */
  writeLog(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with color coding
    const consoleMessage = this.formatConsoleMessage(level, message, meta);
    console.log(consoleMessage);

    // File output
    this.writeToFile(level, formattedMessage);
  }

  /**
   * Format message for console with colors
   */
  formatConsoleMessage(level, message, meta) {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[90m'    // Gray
    };
    const reset = '\x1b[0m';
    
    const color = colors[level] || colors.info;
    const levelStr = `[${level.toUpperCase()}]`.padEnd(7);
    
    let output = `${color}${timestamp} ${levelStr}${reset} ${message}`;
    
    // Add meta information if present
    if (Object.keys(meta).length > 0) {
      output += ` ${JSON.stringify(meta)}`;
    }
    
    return output;
  }

  /**
   * Write to log file
   */
  writeToFile(level, message) {
    try {
      const logFile = path.join(this.logDir, `trackngo-${level}.log`);
      fs.appendFileSync(logFile, message + '\n');
      
      // Check file size and rotate if necessary
      this.rotateLogIfNeeded(logFile);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Rotate log file if it gets too large
   */
  rotateLogIfNeeded(logFile) {
    try {
      const stats = fs.statSync(logFile);
      if (stats.size > this.maxLogSize) {
        const ext = path.extname(logFile);
        const base = path.basename(logFile, ext);
        const dir = path.dirname(logFile);
        
        // Create rotated filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = path.join(dir, `${base}-${timestamp}${ext}`);
        
        // Move current log to rotated file
        fs.renameSync(logFile, rotatedFile);
        
        console.log(`📁 Log file rotated: ${rotatedFile}`);
        
        // Clean up old log files
        this.cleanupOldLogs(dir, base, ext);
      }
    } catch (error) {
      // Ignore rotation errors - not critical
    }
  }

  /**
   * Clean up old log files
   */
  cleanupOldLogs(dir, base, ext) {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.startsWith(base) && file.endsWith(ext))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          mtime: fs.statSync(path.join(dir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Keep only the most recent files
      const filesToDelete = files.slice(this.maxLogFiles);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old log file: ${file.name}`);
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Log methods
   */
  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  /**
   * Specialized logging methods for TrackNGo
   */
  
  // GPS update logging
  gpsUpdate(busId, lat, lng, speed, routeId, processingTime) {
    this.info('GPS update processed', {
      type: 'gps_update',
      bus_id: busId,
      lat,
      lng,
      speed,
      route_id: routeId,
      processing_time_ms: processingTime
    });
  }

  // WebSocket connection logging
  wsConnection(action, clientId, details = {}) {
    this.info(`WebSocket ${action}`, {
      type: 'websocket',
      action,
      client_id: clientId,
      ...details
    });
  }

  // API request logging
  apiRequest(method, path, statusCode, responseTime, clientIp) {
    this.info(`API request ${method} ${path}`, {
      type: 'api_request',
      method,
      path,
      status_code: statusCode,
      response_time_ms: responseTime,
      client_ip: clientIp
    });
  }

  // ETA calculation logging
  etaCalculation(busId, routeId, eta, nextStop, distanceKm) {
    this.debug('ETA calculated', {
      type: 'eta_calculation',
      bus_id: busId,
      route_id: routeId,
      eta,
      next_stop: nextStop,
      distance_km: distanceKm
    });
  }

  // Error logging with stack trace
  errorWithStack(message, error, context = {}) {
    this.error(message, {
      type: 'error',
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }

  // Performance logging
  performance(operation, duration, context = {}) {
    this.debug(`Performance: ${operation}`, {
      type: 'performance',
      operation,
      duration_ms: duration,
      ...context
    });
  }

  // Security logging
  security(event, details = {}) {
    this.warn(`Security event: ${event}`, {
      type: 'security',
      event,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

// Singleton instance
let loggerInstance = null;

function getLogger() {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

module.exports = getLogger();