const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');

router.get('/', AccountController.getAccounts);
router.get('/:accountNumber', AccountController.getAccountByNumber);

module.exports = router;
