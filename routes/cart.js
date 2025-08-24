const express = require('express');
const {
    getCart,
    addToCart,
    updateCartQuantity,
    deleteFromCart,

} = require('../controllers/cart');
const { auth } = require('../Middleware/auth');

const router = express.Router();

router.get('/adding',auth, getCart);  
router.post('/add', auth, addToCart);  
router.put('/update',auth, updateCartQuantity);  
router.delete('/remove',auth, deleteFromCart);  

module.exports = router;
