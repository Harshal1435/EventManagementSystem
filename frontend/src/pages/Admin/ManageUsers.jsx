import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.users || res.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const handleAddUser = async () => {
    try {
      await API.post("/admin/users", {
        ...form,
        role: "user",
      });

      toast.success("User added");
      setForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to add user");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button
        onClick={() => navigate("/admin")}
        className="mb-5 bg-blue-600 text-white px-5 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="User Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded"
          />

          <input
            type="email"
            placeholder="User Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-3 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-3 rounded"
          />
        </div>

        <button
          onClick={handleAddUser}
          className="mt-5 bg-green-600 text-white px-6 py-3 rounded"
        >
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-5 overflow-x-auto">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Role</th>
                <th className="border p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">{item.email}</td>
                  <td className="border p-3">{item.role}</td>
                  <td className="border p-3">
                    <button
                      onClick={() => handleDeleteUser(item._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}