const http = require('http');
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { db } = require('./config/db');
const socketService = require('./services/socketService');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
socketService.init(server);

// Middleware
app.use(cors({
  origin: '*', // Allows connections from React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parsers: handle both JSON and raw text (in case MT5 sends with text/plain)
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['text/*', 'application/json'], limit: '10mb' }));

// Middleware to parse body if it came as a text string from MT5 WebRequest
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // not json, leave as is
    }
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api/mt5/sync')) {
    // Log MT5 heartbeats cleanly
    const account = req.body?.account;
    if (account) {
      logger.bridge(`Heartbeat synced: Broker=${account.broker || 'MT5'} | Account=${account.account_number} | Balance=${account.balance}`);
    }
  } else {
    logger.info(`${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server on 0.0.0.0 to accept IPv4 127.0.0.1 and localhost
const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  logger.success(`=======================================================`);
  logger.success(`🚀 LYQUANT Engine Running on http://127.0.0.1:${PORT}`);
  logger.success(`⚡ WebSocket Gateway Ready for React & MT5 Clients`);
  logger.success(`📊 Free SQLite DB initialized at: ${config.dbFile}`);
  logger.success(`=======================================================`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  logger.warn('Shutting down server...');
  db.close(() => {
    logger.info('SQLite database closed.');
    process.exit(0);
  });
});
