const { dbAsync } = require('../config/db');

class AccountModel {
  static async upsertAccount(data) {
    const {
      account_number,
      broker,
      account_name,
      balance,
      equity,
      margin,
      free_margin,
      leverage,
      currency,
      is_demo
    } = data;

    const sql = `
      INSERT INTO accounts (
        account_number, broker, account_name, balance, equity, 
        margin, free_margin, leverage, currency, is_demo, status, last_heartbeat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONNECTED', CURRENT_TIMESTAMP)
      ON CONFLICT(account_number) DO UPDATE SET
        broker = excluded.broker,
        account_name = excluded.account_name,
        balance = excluded.balance,
        equity = excluded.equity,
        margin = excluded.margin,
        free_margin = excluded.free_margin,
        leverage = excluded.leverage,
        currency = excluded.currency,
        status = 'CONNECTED',
        last_heartbeat = CURRENT_TIMESTAMP
    `;

    return await dbAsync.run(sql, [
      account_number,
      broker,
      account_name,
      balance,
      equity,
      margin,
      free_margin,
      leverage || 100,
      currency || 'USD',
      is_demo ? 1 : 0
    ]);
  }

  static async getAll() {
    return await dbAsync.all('SELECT * FROM accounts ORDER BY last_heartbeat DESC');
  }

  static async getByNumber(account_number) {
    return await dbAsync.get('SELECT * FROM accounts WHERE account_number = ?', [account_number]);
  }
}

module.exports = AccountModel;
