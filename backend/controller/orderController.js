import Order from "../models/Order.model.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      userId: req.user.id,
      products: req.body.products,
      totalAmount: req.body.total,
      status: "Pending"
    });

    res.json(order);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};