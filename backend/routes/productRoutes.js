import express from "express";
import auth from "../middleware/auth.js";

import {
  addProduct,
  getProducts,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  updateStatus
} from "../controller/productControler.js";

const router = express.Router();

// PUBLIC
router.get("/", getProducts);

// VENDOR
router.post("/", auth(["vendor"]), addProduct);
router.get("/my", auth(["vendor"]), getVendorProducts);

router.put("/:id", auth(["vendor"]), updateProduct);     // UPDATE
router.delete("/:id", auth(["vendor"]), deleteProduct);  // DELETE
router.patch("/:id/status", auth(["vendor"]), updateStatus); // STATUS

export default router;