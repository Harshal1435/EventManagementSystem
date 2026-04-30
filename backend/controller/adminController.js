import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Membership from "../models/Membership.model.js";
import Order from "../models/Order.model.js";

// ══════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Name, email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "user" });

    res.status(201).json({ msg: "User added successfully", user });
  } catch {
    res.status(500).json({ msg: "Failed to add user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch {
    res.status(500).json({ msg: "Failed to delete user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) return res.status(400).json({ msg: "Name and email are required" });

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const updates = { name, email };
    if (password && password.trim()) updates.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ msg: "User not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ msg: "Failed to update user" });
  }
};

// ══════════════════════════════════════════
// VENDOR MANAGEMENT
// ══════════════════════════════════════════

export const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json(vendors);
  } catch {
    res.status(500).json({ msg: "Failed to fetch vendors" });
  }
};

export const searchVendors = async (req, res) => {
  try {
    const query = req.query.query?.trim() || "";
    const filter = { role: "vendor" };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }
    const vendors = await User.find(filter).select("_id name email role category").limit(20);
    res.json(vendors);
  } catch {
    res.status(500).json({ msg: "Failed to search vendors" });
  }
};

export const addVendor = async (req, res) => {
  try {
    const { name, email, password, category } = req.body;
    if (!name || !email || !password || !category)
      return res.status(400).json({ msg: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const vendor = await User.create({ name, email, password: hashed, role: "vendor", category });

    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ msg: "Failed to add vendor" });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Vendor deleted" });
  } catch {
    res.status(500).json({ msg: "Failed to delete vendor" });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { name, email, category, password } = req.body;
    if (!name || !email || !category) return res.status(400).json({ msg: "Name, email and category are required" });

    // Check if email is already taken by another vendor
    const existingVendor = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingVendor) return res.status(400).json({ msg: "Email already exists" });

    const updates = { name, email, category };
    if (password && password.trim()) updates.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ msg: "Vendor not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update vendor error:", err);
    res.status(500).json({ msg: "Failed to update vendor" });
  }
};

// ══════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
};

// ══════════════════════════════════════════
// MEMBERSHIP
// ══════════════════════════════════════════

export const getMemberships = async (req, res) => {
  try {
    const data = await Membership.find()
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ msg: "Failed to fetch memberships" });
  }
};

export const addMembership = async (req, res) => {
  try {
    const { vendorId, type, startDate, endDate } = req.body;
    if (!vendorId || !type || !startDate || !endDate)
      return res.status(400).json({ msg: "All fields required" });

    const vendor = await User.findOne({ _id: vendorId, role: "vendor" });
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    // Check if vendor already has a membership
    const existingMembership = await Membership.findOne({ vendorId });
    
    if (existingMembership) {
      // Update existing membership by extending the end date
      const newStartDate = new Date(startDate);
      const newEndDate = new Date(endDate);
      const currentEndDate = new Date(existingMembership.endDate);
      
      // If the new membership starts after current end date, use new dates
      // Otherwise, extend from current end date
      if (newStartDate > currentEndDate) {
        existingMembership.startDate = newStartDate;
        existingMembership.endDate = newEndDate;
      } else {
        // Calculate duration to add
        const durationToAdd = newEndDate - newStartDate;
        existingMembership.endDate = new Date(currentEndDate.getTime() + durationToAdd);
      }
      
      existingMembership.type = type;
      await existingMembership.save();
      
      return res.status(200).json({ 
        msg: "Membership updated successfully", 
        data: existingMembership 
      });
    }

    // Create new membership if none exists
    const data = await Membership.create({ vendorId, type, startDate, endDate });
    res.status(201).json({ msg: "Membership created successfully", data });
  } catch {
    res.status(500).json({ msg: "Failed to add membership" });
  }
};

export const updateMembership = async (req, res) => {
  try {
    const { vendorId, type, startDate, endDate } = req.body;
    const updated = await Membership.findByIdAndUpdate(
      req.params.id,
      { vendorId, type, startDate, endDate },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ msg: "Failed to update membership" });
  }
};

export const deleteMembership = async (req, res) => {
  try {
    await Membership.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
};
