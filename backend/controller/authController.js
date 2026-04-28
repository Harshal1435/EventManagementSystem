import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── SIGNUP ────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, category } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "Name, email and password are required" });

    if (role === "vendor" && !category)
      return res.status(400).json({ msg: "Category is required for vendor" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "user",
      category: role === "vendor" ? category : null,
    });

    res.status(201).json({ msg: "Account created successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Login successful", token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ── ME ────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
