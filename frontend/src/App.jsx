import './App.css';
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup"; 
import AdminDashboard from './pages/Admin/AdminDashboard';  // ✅ ADD THIS
import MembershipPage from "./pages/admin/MembershipPage";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageVendors from "./pages/admin/ManageVendors";
import VendorMembership from "./pages/admin/VendorMembership";

import UserDashboard from "./pages/User/Dashboard";

import Products from "./pages/User/Products";
import Cart from "./pages/User/Cart";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import InsertItemPage from "./pages/vendor/InsertItemPage";
import DeleteItemPage from "./pages/vendor/DeleteItemPage";
import AddNewItemPage from "./pages/vendor/AddNewItemPage";
import ProductStatusPage from "./pages/vendor/ProductStatusPage";
import RequestItemPage from "./pages/vendor/RequestItemPage";
import ViewProductPage from "./pages/vendor/ViewProductPage";
import TransactionPage from "./pages/vendor/TransactionPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
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
      <Route
        path="/admin/membership"
        element={
          <ProtectedRoute role="admin">
            <MembershipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vendors"
        element={
          <ProtectedRoute role="admin">
            <ManageVendors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vendor-membership"
        element={
          <ProtectedRoute role="admin">
            <VendorMembership />
          </ProtectedRoute>
        }
      />


      {/* VENDOR */}
     {/* Vendor */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/insert"
        element={
          <ProtectedRoute role="vendor">
            <InsertItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/delete"
        element={
          <ProtectedRoute role="vendor">
            <DeleteItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/add-new-item"
        element={
          <ProtectedRoute role="vendor">
            <AddNewItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/product-status"
        element={
          <ProtectedRoute role="vendor">
            <ProductStatusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/request-item"
        element={
          <ProtectedRoute role="vendor">
            <RequestItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/view-product"
        element={
          <ProtectedRoute role="vendor">
            <ViewProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/transaction"
        element={
          <ProtectedRoute role="vendor">
            <TransactionPage />
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
    </AuthProvider>
  );
}

export default App;
