import express from "express";
import auth from "../middleware/auth.js";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  adminGetAllBookings,
  adminUpdateBooking,
} from "../controller/bookingController.js";

const router = express.Router();

// ── All STATIC / prefix routes FIRST ──────────────────────

// USER
router.get("/my", auth(["user"]), getUserBookings);
router.post("/", auth(["user"]), createBooking);

// ADMIN — use /admin prefix so they never clash with /:id
router.get("/admin/all", auth(["admin"]), adminGetAllBookings);
router.patch("/admin/update/:id", auth(["admin"]), adminUpdateBooking);

// ── Dynamic :id routes LAST ────────────────────────────────
router.patch("/cancel/:id", auth(["user"]), cancelBooking);

export default router;
