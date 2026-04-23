import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["6months", "1year", "2years"],
    default: "6months",
  },
  startDate: Date,
  endDate: Date,
});

export default mongoose.model("Membership", membershipSchema);