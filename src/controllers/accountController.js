const AccountModel = require('../models/AccountModel');

class AccountController {
  static async getAccounts(req, res, next) {
    try {
      const accounts = await AccountModel.getAll();
      res.json({ success: true, count: accounts.length, data: accounts });
    } catch (err) {
      next(err);
    }
  }

  static async getAccountByNumber(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const account = await AccountModel.getByNumber(accountNumber);
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found.' });
      }
      res.json({ success: true, data: account });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AccountController;
