import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MembershipPage from "./pages/Admin/MembershipPage";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageVendors from "./pages/Admin/ManageVendors";
import VendorMembership from "./pages/Admin/VendorMembership";
import AdminEvents from "./pages/Admin/AdminEvents";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminOrders from "./pages/Admin/Orders";

// User
import UserDashboard from "./pages/User/Dashboard";
import Products from "./pages/User/Products";
import Cart from "./pages/User/Cart";
import CategoryVendors from "./pages/User/CategoryVendors";
import VendorItems from "./pages/User/VendorItems";
import UserOrders from "./pages/User/Orders";
import UserEvents from "./pages/User/Events";
import EventDetail from "./pages/User/EventDetail";
import UserBookings from "./pages/User/Bookings";
import UserGuestList from "./pages/User/GuestList";

// Vendor
import VendorDashboard from "./pages/Vendor/VendorDashboard";
import InsertItemPage from "./pages/Vendor/InsertItemPage";
import DeleteItemPage from "./pages/Vendor/DeleteItemPage";
import AddNewItemPage from "./pages/Vendor/AddNewItemPage";
import ProductStatusPage from "./pages/Vendor/ProductStatusPage";
import RequestItemPage from "./pages/Vendor/RequestItemPage";
import ViewProductPage from "./pages/Vendor/ViewProductPage";
import TransactionPage from "./pages/Vendor/TransactionPage";
import VendorOrders from "./pages/Vendor/Orders";
import VendorEventsPage from "./pages/Vendor/EventsPage";
import CreateEventPage from "./pages/Vendor/CreateEventPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";
import NotFound from "./pages/NotFound";

const PR = ({ role, children }) => (
  <ProtectedRoute role={role}>{children}</ProtectedRoute>
);

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Routes>
          {/* AUTH */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── ADMIN ── */}
          <Route path="/admin" element={<PR role="admin"><AdminDashboard /></PR>} />
          <Route path="/admin/users" element={<PR role="admin"><ManageUsers /></PR>} />
          <Route path="/admin/vendors" element={<PR role="admin"><ManageVendors /></PR>} />
          <Route path="/admin/membership" element={<PR role="admin"><MembershipPage /></PR>} />
          <Route path="/admin/vendor-membership" element={<PR role="admin"><VendorMembership /></PR>} />
          <Route path="/admin/events" element={<PR role="admin"><AdminEvents /></PR>} />
          <Route path="/admin/bookings" element={<PR role="admin"><AdminBookings /></PR>} />
          <Route path="/admin/orders" element={<PR role="admin"><AdminOrders /></PR>} />

          {/* ── VENDOR ── */}
          <Route path="/vendor" element={<PR role="vendor"><VendorDashboard /></PR>} />
          <Route path="/vendor/events" element={<PR role="vendor"><VendorEventsPage /></PR>} />
          <Route path="/vendor/events/create" element={<PR role="vendor"><CreateEventPage /></PR>} />
          <Route path="/vendor/events/:id/edit" element={<PR role="vendor"><CreateEventPage /></PR>} />
          <Route path="/vendor/insert" element={<PR role="vendor"><InsertItemPage /></PR>} />
          <Route path="/vendor/delete" element={<PR role="vendor"><DeleteItemPage /></PR>} />
          <Route path="/vendor/add-item" element={<PR role="vendor"><AddNewItemPage /></PR>} />
          <Route path="/vendor/view-product" element={<PR role="vendor"><ViewProductPage /></PR>} />
          <Route path="/vendor/product-status" element={<PR role="vendor"><ProductStatusPage /></PR>} />
          <Route path="/vendor/request-item" element={<PR role="vendor"><RequestItemPage /></PR>} />
          <Route path="/vendor/transaction" element={<PR role="vendor"><TransactionPage /></PR>} />
          <Route path="/vendor/orders" element={<PR role="vendor"><VendorOrders /></PR>} />

          {/* ── USER ── */}
          <Route path="/user" element={<PR role="user"><UserDashboard /></PR>} />
          <Route path="/user/events" element={<PR role="user"><UserEvents /></PR>} />
          <Route path="/user/events/:id" element={<PR role="user"><EventDetail /></PR>} />
          <Route path="/user/bookings" element={<PR role="user"><UserBookings /></PR>} />
          <Route path="/user/guest-list" element={<PR role="user"><UserGuestList /></PR>} />
          <Route path="/user/products" element={<PR role="user"><Products /></PR>} />
          <Route path="/user/cart" element={<PR role="user"><Cart /></PR>} />
          <Route path="/user/vendors/:category" element={<PR role="user"><CategoryVendors /></PR>} />
          <Route path="/user/vendor-items/:vendorId" element={<PR role="user"><VendorItems /></PR>} />
          <Route path="/user/orders" element={<PR role="user"><UserOrders /></PR>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
