import express from "express";
import auth from "../middleware/auth.js";
import { uploadEventImage, uploadProductImage } from "../middleware/upload.js";

const router = express.Router();

// Upload event image — returns { url }
router.post(
  "/event",
  auth(["vendor", "admin"]),
  uploadEventImage.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    res.json({ url: req.file.path });
  }
);

// Upload product image — returns { url }
router.post(
  "/product",
  auth(["vendor", "admin"]),
  uploadProductImage.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    res.json({ url: req.file.path });
  }
);

export default router;
