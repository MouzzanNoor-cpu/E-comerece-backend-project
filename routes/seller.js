const express = require("express");
const router = express.Router();
const {
  createSeller,
  getSellerById,
  SignInSeller,
  shopsList,
  getShopById,
} = require("../controllers/Seller");
const { auth } = require("../Middleware/auth");

router.post("/create", createSeller);
router.get("/get/:id", auth, getSellerById);
router.post("/signIn-seller", SignInSeller);
router.get("/shop/:id", getShopById);
// router.put('/update/:id', upload.single('image'), updateSeller);
// router.delete('/delete/:id',auth, deleteSeller);

router.get("/shops", shopsList);

module.exports = router;
