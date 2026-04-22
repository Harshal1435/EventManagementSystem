import express from "express";
import auth from "../middleware/auth.js";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controller/cartController.js";

const router = express.Router();

// ➕ ADD TO CART
router.post("/", auth(["user"]), addToCart);

// 📥 GET CART
router.get("/", auth(["user"]), getCart);

// ✏️ UPDATE QUANTITY
router.put("/:id", auth(["user"]), updateCartItem);

// ❌ REMOVE ITEM
router.delete("/:id", auth(["user"]), removeFromCart);

// 🗑️ CLEAR CART
router.delete("/", auth(["user"]), clearCart);

export default router;