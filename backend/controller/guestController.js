import GuestList from "../models/GuestList.model.js";
import Event from "../models/Event.model.js";

// ── ADD GUEST (user only) ─────────────────────────────────
export const addGuest = async (req, res) => {
  try {
    const { eventId, name, email, phone, notes } = req.body;
    if (!name?.trim())
      return res.status(400).json({ msg: "Guest name is required" });

    // eventId is optional — guest can be added without linking to an event
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ msg: "Event not found" });
    }

    const guest = await GuestList.create({
      eventId:     eventId || null,
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

// ── GET MY GUESTS ─────────────────────────────────────────
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

// ── GET GUESTS FOR A SPECIFIC EVENT ──────────────────────
export const getEventGuests = async (req, res) => {
  try {
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

// ── UPDATE GUEST STATUS ───────────────────────────────────
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

// ── DELETE GUEST ──────────────────────────────────────────
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
