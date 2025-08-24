const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error finding products" });
  }
};
const getProductById = async (req, res) => {
  try {
    // Retrieve the id from the route parameters
    const sellerId = req.params.id;
    
    // Log the ID for debugging purposes
    console.log("Product ID:", sellerId);
    
    // Fetch the product from the database using the ID
    const product = await Product.find({ sellerId: sellerId });
    
    // If the product is not found, return a 404 response
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the found product in the response
    return res.status(200).json(product);
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error finding product:", error);
    return res.status(500).json({ message: "Error finding product" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, desc, img, category, size, color, price, sellerId } =
      req.body;
    console.log(req.body);
    if (!title || !desc || !img || !category || !price) {
      return res.status(400).json({ message: "Some fields are empty" });
    }
    const product = new Product({
      title,
      desc,
      img,
      category,
      size,
      color,
      price,
      sellerId,
    });
    console.log(product);
    const createdSeller = await product.save();
    return res.status(201).json({ success: true, seller: createdSeller });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred creating product", error: error });
  }
};
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error updating product" });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting product" });
  }
};

const getAllMyProducts = async (req, res) => {
  try {
    console.log("Getting all my products", req.params.sellerId);
    const sellerId = req.params.id;
    const products = await Product.where({
      sellerId: sellerId,
    });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error finding products" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllMyProducts,
};
