const { dbAsync } = require('../config/db');

class AnalyticsController {
  static async getSummary(req, res, next) {
    try {
      const stats = await dbAsync.get(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as winning_trades,
          SUM(CASE WHEN profit < 0 THEN 1 ELSE 0 END) as losing_trades,
          COALESCE(SUM(profit), 0) as net_profit,
          COALESCE(AVG(profit), 0) as avg_trade,
          MAX(profit) as best_trade,
          MIN(profit) as worst_trade
        FROM trades 
        WHERE status = 'CLOSED'
      `);

      const winRate = stats.total_trades > 0 
        ? ((stats.winning_trades / stats.total_trades) * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          ...stats,
          winRate: `${winRate}%`
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AnalyticsController;
