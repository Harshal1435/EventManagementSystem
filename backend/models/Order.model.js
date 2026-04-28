import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:      { type: String, default: "" },
  price:     { type: Number, default: 0 },
  quantity:  { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products:     [orderProductSchema],
  totalAmount:  { type: Number, default: 0 },
  status:       { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
