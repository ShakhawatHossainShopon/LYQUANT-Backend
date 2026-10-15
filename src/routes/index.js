const express = require('express');
const router = express.Router();

const mt5Routes = require('./mt5Routes');
const tradeRoutes = require('./tradeRoutes');
const accountRoutes = require('./accountRoutes');
const aiRoutes = require('./aiRoutes');
const AnalyticsController = require('../controllers/analyticsController');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'LYQUANT Core Backend',
    timestamp: new Date().toISOString()
  });
});

// Analytics Route
router.get('/analytics/summary', AnalyticsController.getSummary);

// Domain Mounts
router.use('/mt5', mt5Routes);
router.use('/trades', tradeRoutes);
router.use('/accounts', accountRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
