const AccountModel = require('../models/AccountModel');
const TradeModel = require('../models/TradeModel');
const logger = require('../utils/logger');

class RiskService {
  /**
   * Validate trade order against quant risk parameters
   */
  static async validateOrder(order) {
    const { account_number, volume, symbol, sl } = order;

    const account = await AccountModel.getByNumber(account_number);
    if (!account) {
      return { allowed: false, reason: 'Trading account not found or EA not connected.' };
    }

    // Rule 1: Stop Loss validation (if specified, must be positive)
    if (sl && Number(sl) < 0) {
      return { allowed: false, reason: 'Risk Violation: Stop Loss cannot be negative.' };
    }

    // Rule 2: Max lot limit safety barrier
    const MAX_LOT_LIMIT = 10.0;
    if (Number(volume) > MAX_LOT_LIMIT) {
      return { allowed: false, reason: `Risk Violation: Order volume exceeds safety limit of ${MAX_LOT_LIMIT} lots.` };
    }

    // Rule 3: Max Open Positions limit
    const openPositions = await TradeModel.getOpenTrades(account_number);
    if (openPositions.length >= 20) {
      return { allowed: false, reason: 'Risk Violation: Maximum concurrent open positions (20) reached.' };
    }

    return { allowed: true };
  }

  /**
   * Calculate recommended position size based on % risk of equity
   */
  static calculatePositionSize({ equity, riskPercentage, stopLossPips, pipValue = 10 }) {
    if (!equity || !riskPercentage || !stopLossPips) return 0.01;
    const riskAmount = equity * (riskPercentage / 100);
    const calculatedLot = riskAmount / (stopLossPips * pipValue);
    return Math.max(0.01, Math.round(calculatedLot * 100) / 100);
  }
}

module.exports = RiskService;
