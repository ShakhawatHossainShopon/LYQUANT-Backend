const TradeModel = require('../models/TradeModel');
const RiskService = require('../services/riskService');
const Mt5BridgeService = require('../services/mt5BridgeService');

class TradeController {
  static async getOpenTrades(req, res, next) {
    try {
      const { account } = req.query;
      const trades = await TradeModel.getOpenTrades(account);
      res.json({ success: true, count: trades.length, data: trades });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const history = await TradeModel.getHistory(limit);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const { account_number, symbol, order_type, volume, sl, tp } = req.body;

      // 1. Quant Risk Engine Check
      const riskCheck = await RiskService.validateOrder({
        account_number,
        symbol,
        volume,
        sl
      });

      if (!riskCheck.allowed) {
        return res.status(400).json({ success: false, message: riskCheck.reason });
      }

      // 2. Dispatch to MT5 EA Order Queue
      const queued = await Mt5BridgeService.queueOrder({
        account_number,
        action: 'OPEN',
        symbol,
        order_type,
        volume: parseFloat(volume),
        sl: sl ? parseFloat(sl) : null,
        tp: tp ? parseFloat(tp) : null
      });

      res.status(201).json({
        success: true,
        message: 'Order successfully validated and dispatched to MT5 EA queue.',
        order: queued
      });
    } catch (err) {
      next(err);
    }
  }

  static async closePosition(req, res, next) {
    try {
      const { ticket, account_number } = req.body;
      if (!ticket || !account_number) {
        return res.status(400).json({ success: false, message: 'Ticket and account_number are required.' });
      }

      const queued = await Mt5BridgeService.queueOrder({
        account_number,
        action: 'CLOSE',
        ticket: parseInt(ticket, 10),
        symbol: req.body.symbol || 'ALL'
      });

      res.json({
        success: true,
        message: `Close command for position #${ticket} dispatched to MT5 EA.`,
        order: queued
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TradeController;
