import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";

// ── DASHBOARD ─────────────────────────────────────────────
export const vendorDashboard = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });
    res.json({ totalProducts: products.length, products });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET ALL VENDOR PRODUCTS ───────────────────────────────
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── ADD PRODUCT ───────────────────────────────────────────
export const addVendorProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      status: "available",
      vendorId: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── UPDATE PRODUCT ────────────────────────────────────────
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.vendorId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE PRODUCT ────────────────────────────────────────
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.vendorId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── UPDATE PRODUCT STATUS ─────────────────────────────────
export const updateVendorProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.vendorId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

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

// ── GET VENDOR ORDERS ─────────────────────────────────────
// Find orders that contain at least one product belonging to this vendor
export const getVendorOrders = async (req, res) => {
  try {
    // Get all product IDs for this vendor
    const myProducts = await Product.find({ vendorId: req.user.id }).select("_id");
    const myProductIds = myProducts.map(p => p._id.toString());

    // Find orders that contain any of these products
    const allOrders = await Order.find().sort({ createdAt: -1 });

    const vendorOrders = allOrders.filter(order =>
      Array.isArray(order.products) &&
      order.products.some(item => {
        const pid = item.productId?._id?.toString() || item.productId?.toString();
        return myProductIds.includes(pid);
      })
    );

    res.json(vendorOrders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
