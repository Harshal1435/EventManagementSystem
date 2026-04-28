import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, required: true },
  date:        { type: Date,   required: true },
  time:        { type: String, required: true },
  location:    { type: String, required: true },
  venue:       { type: String, default: "" },
  capacity:    { type: Number, required: true },
  price:       { type: Number, default: 0 },
  image:       { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  // who created this event — user OR vendor
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdByRole: { type: String, enum: ["user", "vendor"], default: "vendor" },
  bookedCount:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
