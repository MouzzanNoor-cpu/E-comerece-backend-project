// routes/paymentRoutes.js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

// Create PayPal payment order
router.post('/create', paymentController.createOrder);

// Handle PayPal payment success
router.get('/success', paymentController.paymentSuccess);

// Handle PayPal payment cancel
router.get('/cancel', paymentController.paymentCancel);

module.exports = router;
