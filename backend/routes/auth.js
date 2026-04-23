import express from "express";
import { signup, login , me } from "../controller/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// AUTH FLOW
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth(), me);

export default router;