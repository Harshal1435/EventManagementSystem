import express from "express";
import auth from "../middleware/auth.js";
import {
  getVendorsByCategory,
  getVendorProductsForUser,
  getAllproducts,
  getAllCategories
} from "../controller/userController.js";

const router = express.Router();

router.get("/vendors/:category", auth(["user"]), getVendorsByCategory);
router.get("/vendor-products/:vendorId", auth(["user"]), getVendorProductsForUser);
router.get("/products", auth(["user"]), getAllproducts);
router.get("/categories", auth(["user"]), getAllCategories);
export default router;