import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role });
  res.json(user);
};

// export const login = async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) return res.status(404).send("User not found");

//   const valid = await bcrypt.compare(req.body.password, user.password);
//   if (!valid) return res.status(400).send("Invalid credentials");

//   const token = jwt.sign({ id: user._id, role: user.role }, "secret");
//   res.json({ token });
//   res.status(200).json({ token });
//   res.setCookie("token", token, { httpOnly: true });
//   console.log("User logged in:", token);
// };





export const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIE FIRST
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ SEND RESPONSE ONCE
    res.status(200).json({
      msg: "Login successful",
      token, // optional (for frontend use)
    });

    console.log("User logged in:", token);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};