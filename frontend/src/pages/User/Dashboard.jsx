// src/pages/user/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await API.get("/auth/me");
    const o = await API.get("/orders/my");
    const c = await API.get("/cart");

    setUser(u.data.user);
    setOrders(o.data);
    setCart(c.data);
  };

  const removeFromCart = async (id) => {
    await API.delete(`/cart/${id}`);
    loadData();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        User Dashboard
      </h1>

      {/* PROFILE CARD */}
      <div className="bg-white rounded shadow p-5 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">
          Profile
        </h2>
        <p className="text-gray-800 font-medium">{user?.name}</p>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* CART */}
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Cart
          </h2>

          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            cart.map((c) => (
              <div
                key={c._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-gray-800">
                  {c.productName}
                </span>

                <button
                  onClick={() => removeFromCart(c._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Orders
          </h2>

          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <span className="text-gray-700">
                  ₹{o.total}
                </span>

                <span
                  className={`px-2 py-1 text-sm rounded ${
                    o.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}