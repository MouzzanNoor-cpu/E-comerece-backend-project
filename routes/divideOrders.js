const express = require('express');
const router = express.Router();
const {
  createShop,
  getShopById,
  getAllShops,
  divideOrder,
  shopproduct
} = require('../controllers/shop'); 
const { auth } = require('../Middleware/auth');

router.post('/shop', createShop); 
router.get('/shop/:id', getShopById); 
router.get('/shop', getAllShops); 
router.post('/product-shops/:id',shopproduct);
router.post('/api/order-divide', auth, divideOrder);
module.exports = router;

    