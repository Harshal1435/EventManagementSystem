import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import vendorRoutes from "./routes/venderRoute.js";
import eventRoutes from "./routes/eventRoute.js";
import bookingRoutes from "./routes/bookingRoute.js";
import guestRoutes from "./routes/guestRoute.js";
import uploadRoutes from "./routes/uploadRoute.js";

dotenv.config();

const app = express();

// ✅ ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ DB
connectDB();

// ✅ CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ API routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ✅ Frontend path
const frontendPath = path.join(__dirname, "../frontend");
const frontendDistPath = path.join(frontendPath, "dist");

// ✅ Build frontend only if dist missing
if (!fs.existsSync(path.join(frontendDistPath, "index.html"))) {
  console.log("⚠️ frontend/dist/index.html not found. Building frontend...");

  try {
    execSync("npm install", {
      cwd: frontendPath,
      stdio: "inherit",
    });

    execSync("npm run build", {
      cwd: frontendPath,
      stdio: "inherit",
    });

    console.log("✅ Frontend build created successfully");
  } catch (error) {
    console.error("❌ Frontend build failed:", error.message);
  }
}

// ✅ Serve frontend
app.use(express.static(frontendDistPath));

// ✅ React Router fallback
app.get(/.*/, (req, res, next) => {
  const indexPath = path.join(frontendDistPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// ✅ 404 handler
app.use((_req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// ✅ Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});