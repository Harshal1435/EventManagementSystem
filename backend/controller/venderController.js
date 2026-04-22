import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";


// 📊 VENDOR DASHBOARD
export const vendorDashboard = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });

    const totalProducts = products.length;

    res.json({
      totalProducts,
      products
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 📥 GET ALL VENDOR PRODUCTS
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ➕ ADD PRODUCT
export const addVendorProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      status: "available",
      vendorId: req.user.id
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ✏️ UPDATE PRODUCT
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ❌ DELETE PRODUCT
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 🔄 UPDATE PRODUCT STATUS
export const updateVendorProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 📦 GET ORDERS RELATED TO VENDOR PRODUCTS
export const getVendorOrders = async (req, res) => {
  try {
    // Find all orders containing vendor products
    const orders = await Order.find({
      "products.vendorId": req.user.id
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};