import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Event image storage ───────────────────────────────────
const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eventms/events",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 600, crop: "fill", quality: "auto" }],
  },
});

// ── Product image storage ─────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eventms/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto" }],
  },
});

export const uploadEventImage   = multer({ storage: eventStorage });
export const uploadProductImage = multer({ storage: productStorage });
export { cloudinary };
