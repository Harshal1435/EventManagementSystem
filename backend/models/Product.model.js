import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    status: {
      type: String,
      enum: ["available", "out-of-stock"],
      default: "available"
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);