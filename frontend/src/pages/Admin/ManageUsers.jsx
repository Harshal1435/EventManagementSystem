import { useEffect, useState } from "react";
import { UserPlus, Trash2, CreditCard, Search, Users } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("list"); // list | add
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try { setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return toast.error("Fill all fields");
    try {
      await API.post("/admin/users", { ...form, role: "user" });
      toast.success("User added");
      setForm({ name: "", email: "", password: "" });
      setTab("list");
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await API.delete(`/admin/users/${id}`); toast.success("Deleted"); fetchUsers(); }
    catch { toast.error("Delete failed"); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" userName={userName}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm">{users.length} registered users</p>
        </div>
        <button onClick={() => setTab(tab === "add" ? "list" : "add")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <UserPlus size={16} />
          {tab === "add" ? "View List" : "Add User"}
        </button>
      </div>

      {/* Add Form */}
      {tab === "add" && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-5">Add New User</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { key: "name", placeholder: "Full Name", type: "text" },
              { key: "email", placeholder: "Email Address", type: "email" },
              { key: "password", placeholder: "Password", type: "password" },
            ].map(({ key, placeholder, type }) => (
              <input key={key} type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
              Add User
            </button>
            <button onClick={() => setTab("list")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search users by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u._id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
