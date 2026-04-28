import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  eventId:  { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true }, // user OR vendor who added
  addedByRole: { type: String, enum: ["user", "vendor", "admin"], default: "user" },
  name:   { type: String, required: true },
  email:  { type: String, default: "" },
  phone:  { type: String, default: "" },
  status: { type: String, enum: ["invited", "confirmed", "attended", "cancelled"], default: "invited" },
  notes:  { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("GuestList", guestSchema);
