// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const u = await API.get("/admin/users");
    const o = await API.get("/admin/orders");

    setUsers(u.data);
    setOrders(o.data);
  };

  const deleteUser = async (id) => {
    await API.delete(`/admin/users/${id}`);
    fetchData();
  };

  const updateUser = async (id) => {
    const name = prompt("Enter name");
    if (!name) return;
    await API.put(`/admin/users/${id}`, { name });
    fetchData();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Total Orders" value={orders.length} />
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Users Management
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => updateUser(u._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteUser(u._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Orders Overview
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{o._id}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-sm">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 font-medium">₹{o.total}</td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* 🔹 Reusable Stat Card */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-between items-center">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>
    </div>
  );
}