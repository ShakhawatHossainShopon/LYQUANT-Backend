const Mt5BridgeService = require('../services/mt5BridgeService');
const config = require('../config/config');
const logger = require('../utils/logger');

class Mt5BridgeController {
  /**
   * Endpoint hit by MT5 EA (via WebRequest) every 100ms - 1000ms
   * Synchronizes account balance, open positions, and receives queued commands
   */
  static async sync(req, res, next) {
    try {
      const secret = req.headers['x-bridge-key'] || req.body.secret_key;
      if (secret && secret !== config.bridgeSecretKey) {
        logger.warn('Unauthorized EA connection attempt with invalid secret key.');
        return res.status(401).json({ error: 'Invalid bridge secret key' });
      }

      const response = await Mt5BridgeService.handleHeartbeat(req.body);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Endpoint for MT5 EA to report back order execution results (filled / rejected / closed)
   */
  static async orderResult(req, res, next) {
    try {
      const result = await Mt5BridgeService.handleExecutionResult(req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Mt5BridgeController;
