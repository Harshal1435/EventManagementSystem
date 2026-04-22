import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import vendorRoutes from "./routes/venderRoute.js";

dotenv.config();

const app = express();

// 🔗 CONNECT DATABASE
connectDB();

// 🧩 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🌐 ROOT CHECK
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// 🔐 AUTH
app.use("/api/auth", authRoutes);

// 🏪 PRODUCTS (Vendor + User)
app.use("/api/products", productRoutes);

// 🛒 CART (User)
app.use("/api/cart", cartRoutes);

// 📦 ORDERS (User + Admin)
app.use("/api/orders", orderRoutes);

// 👨‍💼 ADMIN
app.use("/api/admin", adminRoutes);

// 🏪 VENDOR
app.use("/api/vendor", vendorRoutes);

// ❌ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// 🚨 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Server Error" });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});