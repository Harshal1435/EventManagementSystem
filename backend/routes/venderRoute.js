import express from "express";
import auth from "../middleware/auth.js";

import {
  vendorDashboard,
  getMyProducts,
  addVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  updateVendorProductStatus,
  getVendorOrders
} from "../controller/venderController.js";

const router = express.Router();

// DASHBOARD
router.get("/dashboard", auth(["vendor"]), vendorDashboard);

// PRODUCTS
router.get("/products", auth(["vendor"]), getMyProducts);
router.post("/products", auth(["vendor"]), addVendorProduct);

router.put("/products/:id", auth(["vendor"]), updateVendorProduct);
router.delete("/products/:id", auth(["vendor"]), deleteVendorProduct);
router.patch("/products/:id/status", auth(["vendor"]), updateVendorProductStatus);

// ORDERS
router.get("/orders", auth(["vendor"]), getVendorOrders);

export default router;