import { useEffect, useState } from "react";
import { UserPlus, Trash2, Search, Users, Pencil, X, Save } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", email: "", password: "" };

export default function ManageUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [userName, setUserName] = useState("Admin");

  // form mode: null | "add" | "edit"
  const [mode, setMode]   = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("add");
  };

  const openEdit = (u) => {
    setForm({ name: u.name || "", email: u.email || "", password: "" });
    setEditId(u._id);
    setMode("edit");
  };

  const closeForm = () => { setMode(null); setEditId(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and email are required");
    if (mode === "add" && !form.password) return toast.error("Password is required");

    try {
      setSaving(true);
      if (mode === "add") {
        await API.post("/admin/users", { ...form, role: "user" });
        toast.success("User added successfully");
      } else {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await API.put(`/admin/users/${editId}`, payload);
        toast.success("User updated successfully");
      }
      closeForm();
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await API.delete(`/admin/users/${id}`); toast.success("User deleted"); fetchUsers(); }
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
          <h2 className="text-xl font-bold text-slate-800">Maintain User</h2>
          <p className="text-slate-500 text-sm">{users.length} registered users</p>
        </div>
        <button onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Add / Edit Form */}
      {mode && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">
              {mode === "add" ? "Add New User" : "Edit User"}
            </h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Full Name *
              </label>
              <input type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address *
              </label>
              <input type="email" placeholder="user@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password {mode === "edit" && <span className="normal-case font-normal text-slate-400">(leave blank to keep)</span>}
              </label>
              <input type="password" placeholder={mode === "add" ? "Min. 6 characters" : "New password (optional)"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
              <Save size={15} />
              {saving ? "Saving..." : mode === "add" ? "Add User" : "Save Changes"}
            </button>
            <button onClick={closeForm}
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
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition" />
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
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["User", "Email", "Role", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u._id} className={`hover:bg-slate-50 transition ${editId === u._id ? "bg-indigo-50/40" : ""}`}>
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition"
                          title="Edit user">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                          title="Delete user">
                          <Trash2 size={13} />
                        </button>
                      </div>
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
