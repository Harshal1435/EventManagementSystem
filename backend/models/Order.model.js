import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: String,
  products: Array,
  totalAmount: Number,
  status: { type: String, default: "Pending" }
});

export default mongoose.model("Order", orderSchema);