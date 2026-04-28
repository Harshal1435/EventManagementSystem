import express from "express";
import auth from "../middleware/auth.js";
import {
  getUsers, addUser, deleteUser,
  getVendors, addVendor, deleteVendor, searchVendors,
  getAllOrders,
  getMemberships, addMembership, updateMembership, deleteMembership,
} from "../controller/adminController.js";

const router = express.Router();

// ── USERS ─────────────────────────────────────────────────
router.get("/users",        auth(["admin"]), getUsers);
router.post("/users",       auth(["admin"]), addUser);
router.delete("/users/:id", auth(["admin"]), deleteUser);

// ── VENDORS — static routes BEFORE /:id ──────────────────
router.get("/vendors/search", auth(["admin"]), searchVendors);  // MUST be before /:id
router.get("/vendors",        auth(["admin"]), getVendors);
router.post("/vendors",       auth(["admin"]), addVendor);
router.delete("/vendors/:id", auth(["admin"]), deleteVendor);

// ── ORDERS ────────────────────────────────────────────────
router.get("/orders", auth(["admin"]), getAllOrders);

// ── MEMBERSHIPS — static routes BEFORE /:id ──────────────
router.get("/memberships",        auth(["admin"]), getMemberships);
router.post("/memberships",       auth(["admin"]), addMembership);
router.put("/memberships/:id",    auth(["admin"]), updateMembership);
router.delete("/memberships/:id", auth(["admin"]), deleteMembership);

export default router;
