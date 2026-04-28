import Booking from "../models/Booking.model.js";
import Event from "../models/Event.model.js";

// ── CREATE BOOKING (user) — starts as PENDING ─────────────
export const createBooking = async (req, res) => {
  try {
    const { eventId, seats, guestName, guestPhone, notes } = req.body;
    if (!eventId) return res.status(400).json({ msg: "Event ID required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.status === "cancelled")
      return res.status(400).json({ msg: "Event is cancelled" });

    const seatsNum = Math.max(1, Number(seats) || 1);
    const available = event.capacity - (event.bookedCount || 0);
    if (seatsNum > available)
      return res.status(400).json({ msg: `Only ${available} seats available` });

    const totalPrice = (event.price || 0) * seatsNum;

    // Booking starts PENDING — admin must approve
    const booking = await Booking.create({
      userId:        req.user.id,
      eventId,
      seats:         seatsNum,
      totalPrice,
      guestName:     guestName  || "",
      guestPhone:    guestPhone || "",
      notes:         notes      || "",
      status:        "pending",
      paymentStatus: "unpaid",
    });

    const populated = await Booking.findById(booking._id)
      .populate("eventId", "title date time location category price image");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET USER BOOKINGS ─────────────────────────────────────
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("eventId", "title date time location price category status image venue")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── CANCEL BOOKING (user) ─────────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });
    if (booking.status === "cancelled")
      return res.status(400).json({ msg: "Already cancelled" });

    booking.status        = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Only decrement bookedCount if booking was confirmed
    if (booking.status === "confirmed") {
      await Event.findByIdAndUpdate(booking.eventId, {
        $inc: { bookedCount: -booking.seats },
      });
    }

    res.json({ msg: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── ADMIN: GET ALL BOOKINGS ───────────────────────────────
export const adminGetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId",  "name email")
      .populate("eventId", "title date location category")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── ADMIN: APPROVE / REJECT / UPDATE BOOKING ─────────────
export const adminUpdateBooking = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("userId",  "name email")
      .populate("eventId", "title date location category");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const prevStatus = booking.status;

    if (status)        booking.status        = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    // When admin confirms a pending booking → increment bookedCount
    if (prevStatus !== "confirmed" && booking.status === "confirmed") {
      await Event.findByIdAndUpdate(booking.eventId, {
        $inc: { bookedCount: booking.seats },
      });
    }
    // When admin cancels a previously confirmed booking → decrement
    if (prevStatus === "confirmed" && booking.status === "cancelled") {
      await Event.findByIdAndUpdate(booking.eventId, {
        $inc: { bookedCount: -booking.seats },
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
