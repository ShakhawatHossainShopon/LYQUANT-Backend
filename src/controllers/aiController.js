const AIService = require('../services/aiService');
const SignalModel = require('../models/SignalModel');

class AIController {
  static async analyze(req, res, next) {
    try {
      const { symbol = 'EURUSD', timeframe = 'H1', currentPrice = 1.0850 } = req.body;
      const result = await AIService.analyzeMarket({
        symbol,
        timeframe,
        currentPrice: parseFloat(currentPrice)
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async chat(req, res, next) {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required.' });
      }
      const response = await AIService.askAITrader(prompt, context);
      res.json({ success: true, data: response });
    } catch (err) {
      next(err);
    }
  }

  static async getSignals(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const signals = await SignalModel.getRecent(limit);
      res.json({ success: true, count: signals.length, data: signals });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AIController;
