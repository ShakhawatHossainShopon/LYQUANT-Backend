const { dbAsync } = require('../config/db');

class SignalModel {
  static async create(signal) {
    const { symbol, direction, strategy_name, confidence, timeframe, ai_rationale } = signal;
    const sql = `
      INSERT INTO signals (symbol, direction, strategy_name, confidence, timeframe, ai_rationale)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return await dbAsync.run(sql, [symbol, direction, strategy_name, confidence, timeframe, ai_rationale]);
  }

  static async getRecent(limit = 20) {
    return await dbAsync.all('SELECT * FROM signals ORDER BY created_at DESC LIMIT ?', [limit]);
  }
}

module.exports = SignalModel;
