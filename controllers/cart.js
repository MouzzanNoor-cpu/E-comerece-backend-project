const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({ message: "Cart not found" });
    }
    console.log("Cart fetched successfully:", cart);
    return res.status(200).json(cart);
  } catch (err) {
    console.error("Error finding cart items:", err.message);
    return res
      .status(500)
      .json({ message: "Error finding cart items", error: err.message });
  }
};
const addToCart = async (req, res) => {
  const { productId, quantity, type } = req.body;

  console.log(req.body);

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findOne({
      _id: productId,
    });

    console.log("Product found:", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, products: [] });
    }
    const existingProductIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += quantity || 1;
    } else {
      cart.products.push({ productId, quantity: quantity || 1 });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating cart", error: err.message });
  }
};
const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  console.log(
    `Updating quantity for product ID: ${productId} to ${quantity} for user ID: ${req.user.id}`
  );

  if (!productId || quantity == null) {
    console.log("Product ID and quantity are required");
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({ message: "Cart not found" });
    }

    const product = cart.products.find((p) => p.productId.equals(productId));
    if (!product) {
      console.log("Product not found in cart:", productId);
      return res.status(404).json({ message: "Product not found in cart" });
    }

    product.quantity = quantity;
    await cart.save();

    console.log("Cart quantity updated:", cart);
    return res.status(200).json({ message: "Cart quantity updated", cart });
  } catch (err) {
    console.error("Error updating cart quantity:", err.message);
    return res
      .status(500)
      .json({ message: "Error updating cart quantity", error: err.message });
  }
};
const deleteFromCart = async (req, res) => {
  const { productId } = req.body;

  console.log(
    `Removing product ID: ${productId} from cart for user ID: ${req.user.id}`
  );

  if (!productId) {
    console.log("Product ID is required");
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({ message: "Cart not found" });
    }

    const productExists = cart.products.find((p) =>
      p.productId.equals(productId)
    );
    if (!productExists) {
      console.log("Product not found in cart:", productId);
      return res.status(404).json({ message: "Product not found in cart" });
    }
    cart.products = cart.products.filter((p) => !p.productId.equals(productId));
    await cart.save();
    console.log("Product removed from cart:", cart);
    return res.status(200).json({ message: "Product removed from cart", cart });
  } catch (err) {
    console.error("Error deleting product from cart:", err.message);
    return res
      .status(500)
      .json({
        message: "Error deleting product from cart",
        error: err.message,
      });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  deleteFromCart,
};
