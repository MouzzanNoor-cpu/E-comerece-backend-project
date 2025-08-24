const router = require("express").Router();
const { auth } = require("../Middleware/auth");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllMyProducts,
} = require("../controllers/product");

router.get("/products", getAllProducts);
router.get("/productt/:id", auth, getProductById);
router.post("/products", auth, createProduct);
router.put("/products:id", auth, updateProduct);
router.delete("/productss/:id", auth, deleteProduct);

router.get("/my-products/:sellerId", auth, getAllMyProducts);

module.exports = router;
