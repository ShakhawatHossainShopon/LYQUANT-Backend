/**
 * Simple validation helper middleware
 */
const validate = {
  orderCreation: (req, res, next) => {
    const { account_number, symbol, order_type, volume, sl } = req.body;
    if (!account_number || !symbol || !order_type || !volume || !sl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: account_number, symbol, order_type, volume, sl.'
      });
    }

    if (!['BUY', 'SELL'].includes(order_type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order_type. Must be BUY or SELL.'
      });
    }

    next();
  }
};

module.exports = validate;
