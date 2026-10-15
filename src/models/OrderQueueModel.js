const { dbAsync } = require('../config/db');

class OrderQueueModel {
  static async enqueue(orderData) {
    const { account_number, action, symbol, order_type, volume, sl, tp, ticket } = orderData;
    const sql = `
      INSERT INTO order_queue (account_number, action, symbol, order_type, volume, sl, tp, ticket, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `;
    return await dbAsync.run(sql, [account_number, action, symbol, order_type, volume, sl, tp, ticket]);
  }

  static async getPendingOrdersForAccount(account_number) {
    return await dbAsync.all(
      "SELECT * FROM order_queue WHERE account_number = ? AND status = 'PENDING' ORDER BY created_at ASC",
      [account_number]
    );
  }

  static async updateStatus(id, status, error_message = null) {
    return await dbAsync.run(
      "UPDATE order_queue SET status = ?, error_message = ? WHERE id = ?",
      [status, error_message, id]
    );
  }
}

module.exports = OrderQueueModel;
