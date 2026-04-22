import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  vendorId: String,
  type: { type: String, enum: ["6months", "1year", "2years"], default: "6months" },
  startDate: Date,
  endDate: Date
});

export default mongoose.model("Membership", membershipSchema);