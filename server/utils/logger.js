const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists (only in development)
const isProd = process.env.NODE_ENV === 'production';
const logsDir = path.join(__dirname, '..', 'logs');

// Create a console transport that works everywhere
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

const transports = [consoleTransport];

// In non-production, also log to files
if (!isProd) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
    );
  } catch (e) {
    // Silently fall back to console-only if logs directory can't be created
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'finance-tracker-api' },
  transports,
});

module.exports = logger;

