import GuestList from "../models/GuestList.model.js";
import Event from "../models/Event.model.js";
import Booking from "../models/Booking.model.js";

// ── ADD GUEST (user only) ─────────────────────────────────
export const addGuest = async (req, res) => {
  try {
    const { eventId, name, email, phone, notes } = req.body;
    if (!eventId || !name)
      return res.status(400).json({ msg: "Event ID and guest name are required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    // User must have an active booking (pending or confirmed) for this event
    const booking = await Booking.findOne({
      userId:  req.user.id,
      eventId,
      status:  { $in: ["pending", "confirmed"] },
    });
    if (!booking)
      return res.status(403).json({ msg: "You must have a booking to add guests" });

    const guest = await GuestList.create({
      eventId,
      addedBy:     req.user.id,
      addedByRole: "user",
      name:  name.trim(),
      email: email?.trim()  || "",
      phone: phone?.trim()  || "",
      notes: notes?.trim()  || "",
    });

    const populated = await GuestList.findById(guest._id)
      .populate("eventId", "title date location");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET MY GUESTS (user: all guests I added) ──────────────
export const getMyGuests = async (req, res) => {
  try {
    const guests = await GuestList.find({ addedBy: req.user.id })
      .populate("eventId", "title date location category status image")
      .sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET GUESTS FOR A SPECIFIC EVENT (user: only their own) ─
export const getEventGuests = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const guests = await GuestList.find({
      eventId:  req.params.eventId,
      addedBy:  req.user.id,
    })
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── UPDATE GUEST STATUS (user: only their own guests) ─────
export const updateGuestStatus = async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.id);
    if (!guest) return res.status(404).json({ msg: "Guest not found" });

    if (guest.addedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    guest.status = req.body.status || guest.status;
    await guest.save();
    res.json(guest);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE GUEST (user: only their own guests) ────────────
export const deleteGuest = async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.id);
    if (!guest) return res.status(404).json({ msg: "Guest not found" });

    if (guest.addedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await GuestList.findByIdAndDelete(req.params.id);
    res.json({ msg: "Guest removed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── ADMIN: GET ALL GUESTS ─────────────────────────────────
export const adminGetAllGuests = async (req, res) => {
  try {
    const guests = await GuestList.find()
      .populate("eventId", "title date location")
      .populate("addedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
