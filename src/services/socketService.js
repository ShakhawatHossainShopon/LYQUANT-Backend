const { Server } = require('socket.io');
const logger = require('../utils/logger');
const config = require('../config/config');

let io = null;

const socketService = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: config.clientUrl,
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      logger.info(`Web client connected via WebSocket: ${socket.id}`);

      socket.on('subscribe_symbol', (symbol) => {
        socket.join(`symbol_${symbol}`);
        logger.info(`Socket ${socket.id} subscribed to symbol: ${symbol}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Web client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO is not initialized!');
    }
    return io;
  },

  // Broadcast market tick data to frontend
  broadcastTick: (tickData) => {
    if (io) {
      io.emit('market_tick', tickData);
      io.to(`symbol_${tickData.symbol}`).emit('symbol_tick', tickData);
    }
  },

  // Broadcast account balance/equity changes
  broadcastAccountUpdate: (accountData) => {
    if (io) {
      io.emit('account_update', accountData);
    }
  },

  // Broadcast position changes
  broadcastPositionUpdate: (positionData) => {
    if (io) {
      io.emit('position_update', positionData);
    }
  },

  // Broadcast new AI or Quant signals
  broadcastSignal: (signalData) => {
    if (io) {
      io.emit('ai_signal', signalData);
    }
  }
};

module.exports = socketService;
