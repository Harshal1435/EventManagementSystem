import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number,
        price: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);