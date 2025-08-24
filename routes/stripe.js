const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID; // Get it from PayPal
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY; // Get it from PayPal

// PayPal API integration (for creating an order)
router.post("/create-order", async (req, res) => {
  try {
    // PayPal order creation logic goes here
    const { amount } = req.body;
    // Make a POST request to PayPal to create an order
    const response = await fetch("https://api.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${YOUR_ACCESS_TOKEN}`, // Get an access token from PayPal
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            value: amount.toString(),
            currency_code: "USD",
          },
        }],
      }),
    });

    const data = await response.json();
    res.json({ orderID: data.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating PayPal order");
  }
});

module.exports = router;
