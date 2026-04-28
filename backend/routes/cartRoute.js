import express from "express";
import auth from "../middleware/auth.js";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controller/cartController.js";

const router = express.Router();

router.post("/", auth(["user"]), addToCart);
router.get("/", auth(["user"]), getCart);
router.put("/:id", auth(["user"]), updateCartItem);

// IMPORTANT: /clear must come BEFORE /:id to avoid being matched as an id
router.delete("/clear", auth(["user"]), clearCart);
router.delete("/:id", auth(["user"]), removeFromCart);

export default router;
