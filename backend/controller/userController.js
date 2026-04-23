import User from "../models/user.model.js";
import Product from "../models/Product.model.js";

// get vendors by category
export const getVendorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const vendors = await User.find({
      role: "vendor",
      category: category.toLowerCase(),
    }).select("name email category");

    res.json(vendors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// get products of selected vendor
export const getVendorProductsForUser = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const products = await Product.find({
      vendorId,
      status: "available",
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllproducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "available" })
      .populate("vendorId", "name email category");

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
export const getAllCategories = async (req, res) => {
  try {
    const categories = await User.distinct("category", {
      role: "vendor",
      category: { $ne: null },
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};