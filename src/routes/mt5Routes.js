const express = require('express');
const router = express.Router();
const Mt5BridgeController = require('../controllers/mt5BridgeController');

// Heartbeat & data sync from MT5 EA (returns pending orders)
router.post('/sync', Mt5BridgeController.sync);

// Confirmation callback from MT5 EA after executing or closing an order
router.post('/order-result', Mt5BridgeController.orderResult);

module.exports = router;
