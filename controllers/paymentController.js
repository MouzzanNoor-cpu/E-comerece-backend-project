const paypal = require('../config/paypalConfig');

// Create PayPal Payment Order
exports.createOrder = (req, res) => {
  const { totalAmount } = req.body; 

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: totalAmount.toString(),
        },
        description: 'Payment for Order',
      },
    ],
    redirect_urls: {
      return_url: 'http://localhost:4000/api/payment/success',
      cancel_url: 'http://localhost:4000/api/payment/cancel',
    },
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating PayPal payment');
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json({ approval_url: payment.links[i].href });
        }
      }
    }
  });
};

// Handle PayPal Payment Success
exports.paymentSuccess = (req, res) => {
  const paymentId = req.query.paymentId;
  const PayerID = req.query.PayerID;

  const execute_payment_json = {
    payer_id: PayerID,
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error executing PayPal payment');
    } else {
      if (payment.state === 'approved') {
        res.send('Payment Successful');
      } else {
        res.send('Payment not approved');
      }
    }
  });
};

// Handle PayPal Payment Cancellation
exports.paymentCancel = (req, res) => {
  res.send('Payment was canceled');
};
