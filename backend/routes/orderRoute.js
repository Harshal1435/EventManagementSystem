import express from "express";
import auth from "../middleware/auth.js";
import { createOrder, getUserOrders, updateOrderStatus } from "../controller/orderController.js";

const router = express.Router();

// USER
router.post("/", auth(["user"]), createOrder);
router.get("/", auth(["user"]), getUserOrders);

// ADMIN + VENDOR can update order status
router.patch("/:id/status", auth(["admin", "vendor"]), updateOrderStatus);

export default router;
