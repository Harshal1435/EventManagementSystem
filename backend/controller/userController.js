import User from "../models/user.model.js";
import Product from "../models/Product.model.js";

// GET VENDORS BY CATEGORY
export const getVendorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const vendors = await User.find({
      role: "vendor",
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).select("name email category");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET PRODUCTS OF A SPECIFIC VENDOR (for user browsing)
export const getVendorProductsForUser = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({
      vendorId,
      status: { $in: ["available", "active"] },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL AVAILABLE PRODUCTS
export const getAllproducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: { $in: ["available", "active"] },
    }).populate("vendorId", "name email category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL VENDOR CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await User.distinct("category", {
      role: "vendor",
      category: { $ne: null },
    });
    res.json(categories.filter(Boolean));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
