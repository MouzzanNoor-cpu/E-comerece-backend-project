const Accessory = require("../models/accessory");

const getAllAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find();
    return res.status(200).json(accessories);
  } catch (error) {
    return res.status(500).json({ message: "Error finding accessories" });
  }
};

const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    return res.status(200).json(accessory);
  } catch (error) {
    return res.status(500).json({ message: "Error finding accessory" });
  }
};

const createAccessory = async (req, res) => {
  try {
    const { title, desc, img, category, size, color, price, sellerId } =
      req.body;

    if (!title || !desc || !img || !category || !price) {
      return res.status(400).json({ message: "Some fields are empty" });
    }

    const accessory = new Accessory({
      title,
      desc,
      img,
      category,
      size,
      color,
      price,
      sellerId,
    });

    const createdAccessory = await accessory.save();
    return res.status(201).json({ success: true, accessory: createdAccessory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred creating accessory", error: error });
  }
};

const updateAccessory = async (req, res) => {
  try {
    const updatedAccessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAccessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    return res.status(200).json(updatedAccessory);
  } catch (error) {
    return res.status(500).json({ message: "Error updating accessory" });
  }
};

const deleteAccessory = async (req, res) => {
  try {
    const deletedAccessory = await Accessory.findByIdAndDelete(req.params.id);
    if (!deletedAccessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    return res.status(200).json({ message: "Accessory deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting accessory" });
  }
};

module.exports = {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
};
