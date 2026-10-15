const SignalModel = require('../models/SignalModel');
const socketService = require('./socketService');
const logger = require('../utils/logger');

class StrategyService {
  /**
   * Example Quantitative Momentum & Mean Reversion Strategy Evaluator
   */
  static async evaluateSignal({ symbol, timeframe, prices = [] }) {
    if (prices.length < 20) {
      return { status: 'Insufficient data points for analysis' };
    }

    // Calculate Simple Moving Averages
    const smaFast = prices.slice(-9).reduce((a, b) => a + b, 0) / 9;
    const smaSlow = prices.slice(-21).reduce((a, b) => a + b, 0) / 21;
    const currentPrice = prices[prices.length - 1];

    let direction = 'NEUTRAL';
    let confidence = 0.5;
    let rationale = '';

    if (smaFast > smaSlow && currentPrice > smaFast) {
      direction = 'BUY';
      confidence = 0.82;
      rationale = `Fast SMA(9) crossed above Slow SMA(21) with price momentum continuing upward.`;
    } else if (smaFast < smaSlow && currentPrice < smaFast) {
      direction = 'SELL';
      confidence = 0.79;
      rationale = `Fast SMA(9) dropped below Slow SMA(21) indicating bearish trend pressure.`;
    }

    if (direction !== 'NEUTRAL') {
      const signalRecord = {
        symbol,
        direction,
        strategy_name: 'Quant Momentum SMA Cross',
        confidence,
        timeframe: timeframe || 'M15',
        ai_rationale: rationale
      };

      await SignalModel.create(signalRecord);
      socketService.broadcastSignal(signalRecord);
      logger.info(`Generated Quantitative Signal: ${direction} on ${symbol}`);
      return signalRecord;
    }

    return { symbol, direction: 'NEUTRAL', rationale: 'No distinct edge detected in current regime.' };
  }
}

module.exports = StrategyService;
