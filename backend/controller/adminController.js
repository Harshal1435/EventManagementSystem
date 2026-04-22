import User from "../models/user.model.js";
import Membership from "../models/Membership.model.js";
import Order from "../models/Order.model.js";

// GET ALL USERS
export const getUsers = async (req, res) => {
  res.json(await User.find());
};

// DELETE USER
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
};

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  res.json(await Order.find());
};

// MEMBERSHIP - ADD
export const addMembership = async (req, res) => {
  const data = await Membership.create(req.body);
  res.json(data);
};

// MEMBERSHIP - UPDATE
export const updateMembership = async (req, res) => {
  const updated = await Membership.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// MEMBERSHIP - DELETE
export const deleteMembership = async (req, res) => {
  await Membership.findByIdAndDelete(req.params.id);
  res.json({ msg: "Membership deleted" });
};