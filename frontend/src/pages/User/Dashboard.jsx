import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 👤 Get logged-in user
      const userRes = await API.get("/auth/me");
      console.log("USER:", userRes.data);
      setUser(userRes.data.user);

      // 📦 Get user orders
      const orderRes = await API.get("/orders/my-orders");
      console.log("ORDERS:", orderRes.data);
      setOrders(orderRes.data || []);

      // 🛒 Get cart
      const cartRes = await API.get("/cart");
      console.log("CART:", cartRes.data);
      setCartCount(cartRes.data?.items?.length || 0);

    } catch (err) {
      console.error("Dashboard error:", err.response?.data || err.message);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await API.post("/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded shadow flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">User Dashboard</h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* USER INFO */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>

        {user ? (
          <div>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> {user.role}</p>
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">{orders.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Cart Items</p>
          <h2 className="text-xl font-bold">{cartCount}</h2>
        </div>

      </div>

      {/* ORDERS */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">My Orders</h2>

        {orders.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="border p-2">{order._id}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found</p>
        )}
      </div>

    </div>
  );
}