import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

// ROUTES
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

// 🔧 Fix for __dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔗 CONNECT DATABASE
connectDB();

// ✅ CORS (IMPORTANT for production)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ PARSE JSON / FORM DATA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ COOKIE PARSER
app.use(cookieParser());

/* ================= API ROUTES ================= */

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

// 🌐 Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ================= FRONTEND SERVE ================= */

const frontendPath = path.join(__dirname, "../frontend/dist");

// Serve static files
app.use(express.static(frontendPath));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ================= ERROR HANDLING ================= */

// ❌ 404
app.use((_req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// 🚨 GLOBAL ERROR HANDLER
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
