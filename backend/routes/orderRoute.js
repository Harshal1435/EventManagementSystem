import express from "express";
import auth from "../middleware/auth.js";

import {
  createOrder,
  getUserOrders,
  updateOrderStatus
} from "../controller/orderController.js";

const router = express.Router();

// USER
router.post("/", auth(["user"]), createOrder);
router.get("/", auth(["user"]), getUserOrders);

// ADMIN
router.patch("/:id/status", auth(["admin"]), updateOrderStatus);

export default router;