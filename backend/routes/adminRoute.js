import express from "express";
import auth from "../middleware/auth.js";

import {
  getUsers,
  deleteUser,
  getAllOrders,
  addMembership,
  updateMembership,
  deleteMembership
} from "../controller/adminController.js";

const router = express.Router();

// USERS
router.get("/users", auth(["admin"]), getUsers);
router.delete("/users/:id", auth(["admin"]), deleteUser);

// ORDERS
router.get("/orders", auth(["admin"]), getAllOrders);

// MEMBERSHIP
router.post("/membership", auth(["admin"]), addMembership);
router.put("/membership/:id", auth(["admin"]), updateMembership);
router.delete("/membership/:id", auth(["admin"]), deleteMembership);

export default router;