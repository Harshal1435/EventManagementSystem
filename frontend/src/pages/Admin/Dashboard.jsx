import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0 });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await API.get("/admin/users");
      const ordersRes = await API.get("/admin/orders");

      console.log("USERS FULL RESPONSE:", usersRes.data);
      console.log("ORDERS FULL RESPONSE:", ordersRes.data);

      // ✅ FIX: handle different backend response formats safely
      const usersData = usersRes.data?.users || usersRes.data || [];
      const ordersData = ordersRes.data?.orders || ordersRes.data || [];

      setUsers(usersData);

      setStats({
        users: usersData.length,
        orders: ordersData.length,
      });
    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);
    }
  };

  // 🔥 DELETE USER
  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      alert("User deleted");
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // 🔥 UPDATE USER
  const updateUser = async (id) => {
    const newName = prompt("Enter new name");
    if (!newName) return;

    try {
      await API.put(`/admin/users/${id}`, { name: newName });
      alert("User updated");
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const chartData = [
    { name: "Users", value: stats.users },
    { name: "Orders", value: stats.orders },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Users" value={stats.users} />
        <StatCard title="Total Orders" value={stats.orders} />
      </div>

      {/* USERS TABLE */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Users Management</h2>

        {users?.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role}</td>

                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => updateUser(user._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </div>

      {/* MEMBERSHIP */}
      <MembershipActions refresh={fetchData} />

      {/* CHART */}
      <div className="bg-white p-4 rounded shadow h-72 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}

/* 🔹 STAT CARD */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}

/* 🔥 MEMBERSHIP SECTION */
function MembershipActions({ refresh }) {
  const [form, setForm] = useState({ name: "", price: "" });
  const [updateId, setUpdateId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const handleAdd = async () => {
    await API.post("/admin/membership", form);
    alert("Membership Added");
    refresh();
  };

  const handleUpdate = async () => {
    await API.put(`/admin/membership/${updateId}`, form);
    alert("Membership Updated");
    refresh();
  };

  const handleDelete = async () => {
    await API.delete(`/admin/membership/${deleteId}`);
    alert("Membership Deleted");
    refresh();
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-4">Membership Management</h2>

      <div className="grid md:grid-cols-3 gap-4">
        
        {/* ADD */}
        <div>
          <h3 className="font-semibold mb-2">Add</h3>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Price"
            type="number"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Add
          </button>
        </div>

        {/* UPDATE */}
        <div>
          <h3 className="font-semibold mb-2">Update</h3>
          <input
            className="border p-2 w-full mb-2"
            placeholder="ID"
            onChange={(e) => setUpdateId(e.target.value)}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="New Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Update
          </button>
        </div>

        {/* DELETE */}
        <div>
          <h3 className="font-semibold mb-2">Delete</h3>
          <input
            className="border p-2 w-full mb-2"
            placeholder="ID"
            onChange={(e) => setDeleteId(e.target.value)}
          />
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}