const express = require('express');
const router = express.Router();
const TradeController = require('../controllers/tradeController');

router.get('/open', TradeController.getOpenTrades);
router.get('/history', TradeController.getHistory);
router.post('/order', TradeController.createOrder);
router.post('/close', TradeController.closePosition);

module.exports = router;
