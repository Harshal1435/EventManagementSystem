import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  seats: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "cancelled", "pending"], default: "confirmed" },
  paymentStatus: { type: String, enum: ["paid", "unpaid", "refunded"], default: "paid" },
  guestName: { type: String, default: "" },
  guestPhone: { type: String, default: "" },
  notes: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
