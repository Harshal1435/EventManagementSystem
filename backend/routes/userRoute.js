import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllVendors,
  getVendorsByCategory,
  getVendorProductsForUser,
  getAllproducts,
  getAllCategories,
} from "../controller/userController.js";

const router = express.Router();

// GET ALL VENDORS (user browsing)
router.get("/vendors", auth(["user"]), getAllVendors);

// GET VENDORS BY CATEGORY
router.get("/vendors/:category", auth(["user"]), getVendorsByCategory);

// GET PRODUCTS OF A SPECIFIC VENDOR
router.get("/vendor-products/:vendorId", auth(["user"]), getVendorProductsForUser);

// GET ALL AVAILABLE PRODUCTS
router.get("/products", auth(["user"]), getAllproducts);

// GET ALL VENDOR CATEGORIES
router.get("/categories", auth(["user"]), getAllCategories);

export default router;
