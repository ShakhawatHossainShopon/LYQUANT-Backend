const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');

router.post('/analyze', AIController.analyze);
router.post('/chat', AIController.chat);
router.get('/signals', AIController.getSignals);

module.exports = router;
