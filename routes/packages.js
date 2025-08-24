const router = require("express").Router();
const Package = require("../models/packages");
const { auth } = require('../Middleware/auth');


router.get("/package", async (req, res) => {
  try {
    const packages = await Package.find();
    return res.status(200).json(packages);
  } catch (err) {
    return res.status(400).json({ message: "Error finding packages" });
  }
});

router.get("/package/:id", async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    return res.status(200).send(package);
  } catch (error) {
    return res.status(400).send("Error finding package");
  }
});

router.post("/package", auth, async (req, res) => {
  if (!req.body.title || !req.body.desc || !req.body.img || !req.body.color || !req.body.price) {
    return res.status(400).send("Some fields are empty");
  }

  const newPackage = new Package({
    title: req.body.title,
    desc: req.body.desc,
    img: req.body.img,
    color: req.body.color,
    price: req.body.price,
  });

  try {
    const savedPackage = await newPackage.save();
    return res.status(200).send("Package added successfully");
  } catch (error) {
    return res.status(400).send("Error occurred creating package");
  }
});

router.post("/searchByKeyword", async (req, res) => {
  if (!req.body.keyword) {
    return res.status(500).send("Keyword is empty");
  }

  try {
    const packages = await Package.find();
    const filteredPackages = packages.filter(pkg =>
      JSON.stringify(pkg).toLowerCase().includes(req.body.keyword.toLowerCase())
    );
    return res.status(200).send(filteredPackages);
  } catch (err) {
    return res.status(400).send("Error finding packages");
  }
});

module.exports = router;
