import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function TransactionPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/vendor/orders");
      setOrders(res.data.orders || res.data || []);
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button
        onClick={() => navigate("/vendor")}
        className="mb-5 bg-blue-600 text-white px-5 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">User Request</h1>

      <div className="bg-white rounded-xl shadow p-5 overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Order ID</th>
              <th className="border p-3 text-left">User</th>
              <th className="border p-3 text-left">Total</th>
              <th className="border p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border p-3">{order._id}</td>
                <td className="border p-3">
                  {order.userId?.name || order.user?.name || "User"}
                </td>
                <td className="border p-3">
                  ₹{order.totalAmount || order.total || 0}
                </td>
                <td className="border p-3">{order.status || "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}