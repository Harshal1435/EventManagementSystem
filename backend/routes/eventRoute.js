import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllEvents, getEventById,
  createEvent, updateEvent, deleteEvent,
  getMyEvents, updateEventStatus, getEventBookings,
  adminGetAllEvents, adminDeleteEvent,
} from "../controller/eventController.js";

const router = express.Router();

// ── STATIC routes MUST come before /:id wildcard ──────────

// PUBLIC
router.get("/", getAllEvents);

// USER + VENDOR: get my own events
router.get("/my", auth(["user", "vendor"]), getMyEvents);

// ADMIN static routes
router.get("/admin/all", auth(["admin"]), adminGetAllEvents);
router.delete("/admin/:id", auth(["admin"]), adminDeleteEvent);

// USER + VENDOR: create / edit / delete their own events
router.post("/", auth(["user", "vendor"]), createEvent);
router.put("/:id", auth(["user", "vendor"]), updateEvent);
router.delete("/:id", auth(["user", "vendor"]), deleteEvent);
router.patch("/:id/status", auth(["user", "vendor"]), updateEventStatus);
router.get("/:id/bookings", auth(["user", "vendor", "admin"]), getEventBookings);

// PUBLIC single event — last so it doesn't swallow static routes
router.get("/:id", getEventById);

export default router;
