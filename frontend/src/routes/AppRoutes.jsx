import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";   // ✅ ADD THIS

import AdminDashboard from "../pages/Admin/Dashboard";
import VendorDashboard from "../pages/Vendor/Dashboard";
import UserDashboard from "../pages/User/Dashboard";

import Products from "../pages/User/Products";
import Cart from "../pages/User/Cart";

import VendorProducts from "../pages/Vendor/Products";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* ✅ SIGNUP ROUTE */}

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* VENDOR */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <ProtectedRoute role="vendor">
            <VendorProducts />
          </ProtectedRoute>
        }
      />

      {/* USER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/products"
        element={
          <ProtectedRoute role="user">
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/cart"
        element={
          <ProtectedRoute role="user">
            <Cart />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}