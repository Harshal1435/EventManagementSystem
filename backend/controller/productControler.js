import Product from "../models/Product.model.js";

// ➕ ADD PRODUCT (Vendor)
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      status: req.body.status || "available",
      vendorId: req.user.id
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 📥 GET ALL PRODUCTS (Public / User)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("vendorId", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🏪 GET VENDOR PRODUCTS (Vendor Only)
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✏️ UPDATE PRODUCT (Vendor Only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    // 🔐 Ownership check
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

// ❌ DELETE PRODUCT (Vendor Only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    // 🔐 Ownership check
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔄 UPDATE PRODUCT STATUS (Vendor Only)
export const updateStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    // 🔐 Ownership check
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