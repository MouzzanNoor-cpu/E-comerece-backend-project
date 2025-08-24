const Order = require('../models/Order'); 


const createOrder = async (req, res) => {
    try {
        const { userId, products, amount, name, phone, address, status, shopId } = req.body;

        // Create a new order
        const newOrder = new Order({
            userId,
            products,
            amount,
            name,
            phone,
            address,
            status, 
            shopId
        });
        const savedOrder = await newOrder.save();
        return res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
};
const getOneOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find(); 
        const totalOrders = await Order.countDocuments();
        res.status(200).json({
            totalOrders, 
            orders       
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
const deleteOneOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
};
const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'accepted' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order accepted successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept order' });
    }
};
const LateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'late' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order marked as late', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
const DeliveredOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'delivered' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order marked as delivered', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
const INPROGRESSorder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'in-progress' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order is now in progress', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
const CancelledOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};


module.exports = {
    createOrder,
    getOneOrder,
    getAllOrders,
    deleteOneOrder,
    acceptOrder,
    LateOrder,
    DeliveredOrder,
    INPROGRESSorder,
    CancelledOrder
};
