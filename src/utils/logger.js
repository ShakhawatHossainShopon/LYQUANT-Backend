const logger = {
  info: (msg, meta = '') => console.log(`[INFO]  [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  success: (msg, meta = '') => console.log(`[SUCCESS] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  warn: (msg, meta = '') => console.warn(`[WARN]  [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  error: (msg, meta = '') => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  bridge: (msg, meta = '') => console.log(`[MT5 BRIDGE] [${new Date().toISOString()}] ${msg}`, meta ? meta : '')
};

module.exports = logger;
