import express from "express";
import { signup, login } from "../controller/authController.js";

const router = express.Router();

// AUTH FLOW
router.post("/signup", signup);
router.post("/login", login);

export default router;