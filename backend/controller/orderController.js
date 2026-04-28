import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Cart from "../models/Cart.model.js";

// ── CREATE ORDER ──────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const items = req.body.items || req.body.products || [];
    if (!items.length) return res.status(400).json({ msg: "No items in order" });

    const orderProducts = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const qty = Number(item.quantity) || 1;
      orderProducts.push({
        productId: product._id,
        name:      product.name,
        price:     product.price,
        quantity:  qty,
      });
      totalAmount += product.price * qty;
    }

    if (!orderProducts.length) return res.status(400).json({ msg: "No valid products found" });

    const order = await Order.create({
      userId:      req.user.id,
      products:    orderProducts,
      totalAmount,
      status:      "Pending",
    });

    // Clear the user's cart after order
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

    const populated = await Order.findById(order._id).populate("userId", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET USER ORDERS ───────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── UPDATE ORDER STATUS (ADMIN / VENDOR) ──────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
