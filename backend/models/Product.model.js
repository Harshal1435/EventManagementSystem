import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      // "available"/"active" = visible to users, "inactive"/"requested"/"sold" = hidden
      enum: ["available", "active", "inactive", "requested", "sold"],
      default: "available",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
