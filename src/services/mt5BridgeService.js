const AccountModel = require('../models/AccountModel');
const TradeModel = require('../models/TradeModel');
const OrderQueueModel = require('../models/OrderQueueModel');
const socketService = require('./socketService');
const logger = require('../utils/logger');

class Mt5BridgeService {
  /**
   * Process heartbeat & sync from MT5 Expert Advisor
   */
  static async handleHeartbeat(payload) {
    const { account, positions, ticks } = payload;

    // 1. Update Account State in SQLite
    if (account) {
      await AccountModel.upsertAccount(account);
      socketService.broadcastAccountUpdate(account);
    }

    // 2. Sync Positions
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        await TradeModel.syncOpenPosition({
          ...pos,
          account_number: account ? account.account_number : 'UNKNOWN'
        });
      }
      socketService.broadcastPositionUpdate({
        account_number: account?.account_number,
        positions
      });
    }

    // 3. Broadcast real-time ticks to frontend charts if included
    if (Array.isArray(ticks)) {
      ticks.forEach((tick) => socketService.broadcastTick(tick));
    }

    // 4. Retrieve any pending orders destined for this EA/account
    const pendingOrders = account?.account_number
      ? await OrderQueueModel.getPendingOrdersForAccount(account.account_number)
      : [];

    return {
      status: 'OK',
      timestamp: Date.now(),
      pendingOrders
    };
  }

  /**
   * Queue a trade command from the React frontend or AI Engine to the MT5 EA
   */
  static async queueOrder(orderData) {
    logger.bridge(`Queuing order for EA execution: ${orderData.action} ${orderData.order_type || ''} ${orderData.symbol}`);
    const result = await OrderQueueModel.enqueue(orderData);
    return { orderId: result.lastID, ...orderData, status: 'QUEUED' };
  }

  /**
   * EA acknowledges order completion or failure
   */
  static async handleExecutionResult(resultPayload) {
    const { orderQueueId, ticket, success, message, close_price, profit } = resultPayload;

    if (orderQueueId) {
      await OrderQueueModel.updateStatus(
        orderQueueId,
        success ? 'COMPLETED' : 'FAILED',
        message
      );
    }

    if (ticket && close_price !== undefined) {
      await TradeModel.markClosed(ticket, close_price, profit || 0);
    }

    logger.bridge(`Execution ack received for ticket #${ticket}: ${success ? 'SUCCESS' : 'FAILED'}`);
    return { acknowledged: true };
  }
}

module.exports = Mt5BridgeService;
