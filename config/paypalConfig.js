
const paypal = require('paypal-rest-sdk');

// Load environment variables (make sure to create a .env file with your credentials)
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID, // Add your PayPal client ID here
  client_secret: process.env.PAYPAL_SECRET_KEY, // Add your PayPal secret key here
});

module.exports = paypal;
