const config = require('../config/config');

/**
 * Bridge Token authentication middleware for MT5 EA
 */
function bridgeAuth(req, res, next) {
  const token = req.headers['x-bridge-key'] || req.body?.secret_key;
  if (!token || token !== config.bridgeSecretKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing MT5 bridge authentication key.'
    });
  }
  next();
}

module.exports = { bridgeAuth };
