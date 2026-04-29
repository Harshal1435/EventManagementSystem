import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
// ROUTES
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

// 🔗 CONNECT DATABASE
connectDB();

// ✅ CORS FIX
app.use(
  cors({
    origin: "https://event-management-system-i2dv.vercel.app/",
    credentials: true,
  })
);

// ✅ PARSE JSON / FORM DATA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ COOKIE PARSER
app.use(cookieParser());

// 🌐 ROOT CHECK
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});


app.use("/api/user", userRoutes);

// 🔐 AUTH
app.use("/api/auth", authRoutes);

// 🏪 PRODUCTS
app.use("/api/products", productRoutes);

// 🛒 CART
app.use("/api/cart", cartRoutes);

// 📦 ORDERS
app.use("/api/orders", orderRoutes);

// 👨‍💼 ADMIN
app.use("/api/admin", adminRoutes);

// 🏪 VENDOR
app.use("/api/vendor", vendorRoutes);

// 🎉 EVENTS
app.use("/api/events", eventRoutes);

// 🎟️ BOOKINGS
app.use("/api/bookings", bookingRoutes);

// 👥 GUESTS
app.use("/api/guests", guestRoutes);

// 📸 UPLOADS (Cloudinary)
app.use("/api/upload", uploadRoutes);

// ❌ 404 HANDLER
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

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
