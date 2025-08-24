const bcrypt = require('bcryptjs');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/shops/shops');
const User = require('../models/User');


const createShop = async (req, res) => {
  try {
    const { shopName, phoneNumber, email, address, zipCode, password } = req.body;

    // Log incoming data
    console.log("Received data:", req.body);

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newShop = new Shop({
      shopName,
      phoneNumber,
      email,
      address,
      zipCode,
      password: hashedPassword,
    });

    await newShop.save();
    res.status(201).json({ message: 'Shop created successfully', shop: newShop });
  } catch (error) {
    console.error('Error creating shop:', error); // More detailed error logging
    res.status(500).json({ error: error.message });
  }
};


// Get shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Divide Order
const divideOrder = async (req, res) => {
  try {
    const { email, name, phone, address } = req.body; 
    const userId = req.user.id;
    console.log("Authenticated User ID:", userId);
    const cartItems = await Cart.find({ userId }).populate({
      path: 'products.productId', 
      model: Product, 
    });
    console.log("Cart Items:", JSON.stringify(cartItems, null, 2));
    if (!cartItems.length) {
      return res.status(404).json({
        success: false,
        message: "No items in the cart.",
      });
    }
    const ordersByShop = {};
    for (const cartItem of cartItems) {
      for (const product of cartItem.products) { 
        const { productId, quantity } = product; 
        const shopId = productId.shopId; 
        if (!shopId) {
          return res.status(400).json({ success: false, message: 'Product shopId is missing.' });
        }
        const amount = productId.price * quantity;
        const newOrder = new Order({
          userId: userId,
          products: [{ productId: productId._id, quantity }],
          shopId: shopId,
          email: email,
          name: name, 
          phone: phone, 
          address: address, 
          amount: amount,
        });
        if (!ordersByShop[shopId]) {
          ordersByShop[shopId] = { orders: [] };
        }
        ordersByShop[shopId].orders.push(newOrder);
      }
    }
    const savedOrders = [];
    for (const shopId in ordersByShop) {
      const { orders } = ordersByShop[shopId];
      const savedShopOrders = await Promise.all(orders.map(order => order.save())); 
      savedOrders.push(savedShopOrders); 
    }
    const flattenedSavedOrders = savedOrders.flat();

    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userId },
      { order_status: 'pending' },
      { new: true }
    );
    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Failed to update cart status.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.status(200).json({
      success: true,
      savedOrders: flattenedSavedOrders,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const shopproduct = async (req, res) => {
  try {
    const shopId = req.params.id; 

    const products = await Product.find({ shopId: shopId });

    if (!products || products.length === 0) {
      return res.status(404).send("No products found for this shop.");
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).send(error.message); 
  }
};

module.exports = {
  createShop,
  getShopById,
  getAllShops,
  divideOrder,
  shopproduct
};
