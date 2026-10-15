const { dbAsync } = require('../config/db');

class TradeModel {
  static async syncOpenPosition(position) {
    const {
      ticket,
      account_number,
      symbol,
      trade_type,
      lots,
      open_price,
      stop_loss,
      take_profit,
      profit,
      magic_number
    } = position;

    const sql = `
      INSERT INTO trades (
        ticket, account_number, symbol, trade_type, lots,
        open_price, stop_loss, take_profit, profit, status, magic_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
      ON CONFLICT(ticket) DO UPDATE SET
        stop_loss = excluded.stop_loss,
        take_profit = excluded.take_profit,
        profit = excluded.profit,
        status = 'OPEN'
    `;

    return await dbAsync.run(sql, [
      ticket,
      account_number,
      symbol,
      trade_type,
      lots,
      open_price,
      stop_loss,
      take_profit,
      profit,
      magic_number || 9999
    ]);
  }

  static async markClosed(ticket, close_price, profit) {
    const sql = `
      UPDATE trades 
      SET status = 'CLOSED', close_price = ?, profit = ?, close_time = CURRENT_TIMESTAMP
      WHERE ticket = ?
    `;
    return await dbAsync.run(sql, [close_price, profit, ticket]);
  }

  static async getOpenTrades(account_number = null) {
    if (account_number) {
      return await dbAsync.all(
        "SELECT * FROM trades WHERE status = 'OPEN' AND account_number = ? ORDER BY open_time DESC",
        [account_number]
      );
    }
    return await dbAsync.all("SELECT * FROM trades WHERE status = 'OPEN' ORDER BY open_time DESC");
  }

  static async getHistory(limit = 100) {
    return await dbAsync.all(
      "SELECT * FROM trades WHERE status = 'CLOSED' ORDER BY close_time DESC LIMIT ?",
      [limit]
    );
  }
}

module.exports = TradeModel;
