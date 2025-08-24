const router = require("express").Router();
const GraphicCard = require("../models/Graphiccards")
const { auth } = require('../Middleware/auth');

// Get all graphic cards
router.get("/graphiccard", async (req, res) => {
  try {
    const graphicCards = await GraphicCard.find();
    return res.status(200).json(graphicCards);
  } catch (err) {
    return res.status(400).json({ message: "Error finding graphic cards" });
  }
});

// Get graphic card by ID
router.get("/graphiccard/:id", async (req, res) => {
  try {
    let graphicCard = await GraphicCard.findById(req.params.id);
    return res.status(200).send(graphicCard);
  } catch (error) {
    return res.status(400).send(JSON.stringify("Error finding graphic card"));
  }
});

// Add new graphic card (admin only)
router.post("/graphiccard", auth, async (req, res) => {
  console.log("Request received for adding graphic card");
  
  if (req.body.title === "" || req.body.desc === "" 
    || req.body.img === "" || req.body.color === "" 
    || req.body.price === "") {
    return res.status(400).send("Some fields are empty");
  }

  const graphicCard = new GraphicCard({
    title: req.body.title,
    desc: req.body.desc,
    img: req.body.img,
    color: req.body.color,
    price: req.body.price,
  });

  try {
    const savedGraphicCard = await graphicCard.save();
    return res.status(200).send("Graphic card added successfully");
  } catch (error) {
    return res.status(400).send("Error occurred creating graphic card");
  }
});

// Search graphic card by keyword
router.post("/searchByKeyword", async (req, res) => {
  if (req.body.keyword == null) {
    return res.status(500).send(JSON.stringify("Keyword is empty"));
  }

  GraphicCard.find((err, graphicCards) => {
    if (err) {
      return res.status(400).send(JSON.stringify("Error finding graphic cards"));
    }

    return res.status(200).send(
      graphicCards.filter((x) =>
        JSON.stringify(x).toLowerCase().includes(req.body.keyword.toLowerCase())
      )
    );
  });
});

module.exports = router;
