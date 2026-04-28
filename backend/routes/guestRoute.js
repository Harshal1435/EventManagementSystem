import express from "express";
import auth from "../middleware/auth.js";
import {
  addGuest,
  getMyGuests,
  getEventGuests,
  updateGuestStatus,
  deleteGuest,
  adminGetAllGuests,
} from "../controller/guestController.js";

const router = express.Router();

// ── STATIC routes FIRST (before /:id) ─────────────────────

// USER only: add a guest (must have confirmed booking)
router.post("/", auth(["user"]), addGuest);

// USER only: get all guests I added
router.get("/my", auth(["user"]), getMyGuests);

// ADMIN only: get all guests
router.get("/admin/all", auth(["admin"]), adminGetAllGuests);

// USER only: get guests for a specific event (only their own)
router.get("/event/:eventId", auth(["user"]), getEventGuests);

// ── DYNAMIC :id routes LAST ────────────────────────────────
// USER only: update / delete their own guest
router.patch("/:id/status", auth(["user"]), updateGuestStatus);
router.delete("/:id",       auth(["user"]), deleteGuest);

export default router;
