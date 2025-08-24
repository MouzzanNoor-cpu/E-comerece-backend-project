const router = require("express").Router();
const Accessory = require("../models/Accessories");
const Product = require("../models/Product");
const { auth } = require("../Middleware/auth");

// Get all accessories
router.get("/accessory", async (req, res) => {
  try {
    const accessories = await Product.where({
      type: "accessory",
    });
    return res.status(200).json(accessories);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error finding accessories", error: err.message });
  }
});

// Get accessory by ID
router.get("/accessory/:id", async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    return res.status(200).json(accessory);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error finding accessory", error: error.message });
  }
});

// Add new accessory (admin only)
router.post("/accessory", auth, async (req, res) => {
  console.log("Request received for adding accessory");

  if (
    req.body.title === "" ||
    req.body.desc === "" ||
    req.body.img === "" ||
    req.body.color === "" ||
    req.body.price === ""
  ) {
    return res.status(400).send("Some fields are empty");
  }

  const accessory = new Accessory({
    title: req.body.title,
    desc: req.body.desc,
    img: req.body.img,
    color: req.body.color,
    price: req.body.price,
  });

  try {
    const savedAccessory = await accessory.save();
    return res.status(200).send("Accessory added successfully");
  } catch (error) {
    return res.status(400).send("Error occurred creating accessory");
  }
});

// Search accessory by keyword
router.post("/searchByKeyword", async (req, res) => {
  const keyword = req.body.keyword;

  // Check if the keyword is provided
  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Keyword is empty" });
  }

  try {
    const accessories = await Accessory.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } }, // Case-insensitive search
        { desc: { $regex: keyword, $options: "i" } },
        { color: { $regex: keyword, $options: "i" } },
      ],
    });

    if (accessories.length === 0) {
      return res
        .status(404)
        .json({ message: "No accessories found matching the keyword" });
    }

    return res.status(200).json(accessories);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error finding accessories", error: err.message });
  }
});

module.exports = router;
