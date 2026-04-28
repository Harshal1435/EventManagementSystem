import Event from "../models/Event.model.js";
import Booking from "../models/Booking.model.js";

// ─── PUBLIC ───────────────────────────────────────────────

export const getAllEvents = async (req, res) => {
  try {
    const { category, status, search, createdBy } = req.query;
    const filter = {};
    if (category)  filter.category  = category;
    if (status)    filter.status    = status;
    if (createdBy) filter.createdBy = createdBy;
    if (search)    filter.title     = { $regex: search, $options: "i" };

    const events = await Event.find(filter)
      .populate("createdBy", "name email role")
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email role");
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── USER + VENDOR ────────────────────────────────────────

// CREATE EVENT (user or vendor)
export const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, location, venue, capacity, price, image } = req.body;
    if (!title || !category || !date || !time || !location || !capacity)
      return res.status(400).json({ msg: "Required fields missing" });

    const event = await Event.create({
      title, description, category, date, time, location, venue,
      capacity: Number(capacity),
      price:    Number(price) || 0,
      image,
      createdBy:   req.user.id,
      createdByRole: req.user.role,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE EVENT — only the creator can update
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE EVENT — only the creator can delete
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: "Event deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET MY EVENTS — user or vendor sees their own
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE EVENT STATUS — only creator
export const updateEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    event.status = req.body.status;
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET BOOKINGS FOR AN EVENT — creator or admin
export const getEventBookings = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    // Admin can see all; creator can see their own event bookings
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    const bookings = await Booking.find({ eventId: req.params.id })
      .populate("userId", "name email");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────

export const adminGetAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const adminDeleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: "Event deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
