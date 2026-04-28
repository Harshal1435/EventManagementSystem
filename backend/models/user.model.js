import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "vendor", "user"],
      default: "user",
    },
    // Vendor category — includes both product and event categories
    category: {
      type: String,
      enum: [
        // Product categories
        "grocery", "electronics", "fashion", "food", "medicine",
        // Event categories
        "wedding", "concert", "conference", "birthday", "corporate", "other",
        null,
      ],
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
