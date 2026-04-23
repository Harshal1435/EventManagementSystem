import User from "../models/user.model.js";
import Membership from "../models/Membership.model.js";
import Order from "../models/Order.model.js";

// =========================
// USER MANAGEMENT
// =========================

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

// ADD USER
export const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    res.status(201).json({
      msg: "User added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to add user" });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete user" });
  }
};

// =========================
// VENDOR MANAGEMENT
// =========================

// GET ALL VENDORS
export const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch vendors" });
  }
};

// SEARCH VENDORS BY NAME OR EMAIL
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

    const vendors = await User.find(filter)
      .select("_id name email role")
      .limit(20);

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ msg: "Failed to search vendors" });
  }
};

// ADD VENDOR
export const addVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Vendor already exists" });
    }

    const vendor = await User.create({
      name,
      email,
      password,
      role: "vendor",
    });

    res.status(201).json({
      msg: "Vendor added successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to add vendor" });
  }
};

// DELETE VENDOR
export const deleteVendor = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Vendor deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete vendor" });
  }
};

// =========================
// ORDERS
// =========================

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
};

// =========================
// MEMBERSHIP
// =========================

// GET ALL MEMBERSHIPS
export const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().lean();

    const vendorIds = memberships.map((m) => m.vendorId).filter(Boolean);

    const vendors = await User.find({ _id: { $in: vendorIds } })
      .select("_id name email")
      .lean();

    const vendorMap = {};
    vendors.forEach((vendor) => {
      vendorMap[String(vendor._id)] = vendor;
    });

    const mergedMemberships = memberships.map((item) => ({
      ...item,
      vendor: vendorMap[String(item.vendorId)] || null,
    }));

    res.json(mergedMemberships);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch memberships" });
  }
};

// ADD MEMBERSHIP
export const addMembership = async (req, res) => {
  try {
    const { vendorId, type, startDate, endDate } = req.body;

    if (!vendorId || !type || !startDate || !endDate) {
      return res.status(400).json({ msg: "All membership fields are required" });
    }

    const vendor = await User.findOne({ _id: vendorId, role: "vendor" });
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const data = await Membership.create({
      vendorId,
      type,
      startDate,
      endDate,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Failed to add membership" });
  }
};

// UPDATE MEMBERSHIP
export const updateMembership = async (req, res) => {
  try {
    const { vendorId, type, startDate, endDate } = req.body;

    if (!vendorId || !type || !startDate || !endDate) {
      return res.status(400).json({ msg: "All membership fields are required" });
    }

    const vendor = await User.findOne({ _id: vendorId, role: "vendor" });
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const updated = await Membership.findByIdAndUpdate(
      req.params.id,
      {
        vendorId,
        type,
        startDate,
        endDate,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Membership not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: "Failed to update membership" });
  }
};

// DELETE MEMBERSHIP
export const deleteMembership = async (req, res) => {
  try {
    await Membership.findByIdAndDelete(req.params.id);
    res.json({ msg: "Membership deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete membership" });
  }
};