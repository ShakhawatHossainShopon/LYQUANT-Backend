require('dotenv').config();

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbFile: process.env.DB_FILE || './data/lyquant.db',
  bridgeSecretKey: process.env.BRIDGE_SECRET_KEY || 'lyquant_default_secret_key',
  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini'
  }
};

module.exports = config;
