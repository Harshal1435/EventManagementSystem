import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role });
  res.json(user);
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).send("Invalid credentials");

  const token = jwt.sign({ id: user._id, role: user.role }, "secret");
  res.json({ token });
  console.log("User logged in:", token);
};
