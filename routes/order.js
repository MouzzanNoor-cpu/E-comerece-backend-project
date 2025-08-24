const express = require('express');
const router = express.Router();
const {
    getOneOrder,
    getAllOrders,
    deleteOneOrder,
    acceptOrder,
    LateOrder,
    DeliveredOrder,
    INPROGRESSorder,
    CancelledOrder,
    createOrder
} = require('../controllers/order');
const { auth } = require('../Middleware/auth');

router.post('/postorder', auth,createOrder);
router.get('/getorder/:orderId',auth, getOneOrder);
router.get('/getall',auth, getAllOrders);
router.delete('/deleteone/:orderId',auth, deleteOneOrder);
router.put('/accept/:orderId',auth, acceptOrder);
router.put('/late/:orderId',auth, LateOrder);
router.put('/delivered/:orderId',auth, DeliveredOrder);
router.put('/in-progress/:orderId',auth, INPROGRESSorder);
router.put('/cancel/:orderId',auth, CancelledOrder);

module.exports = router;
