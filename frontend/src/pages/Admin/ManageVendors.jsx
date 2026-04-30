import { useEffect, useState } from "react";
import { Store, UserPlus, Trash2, Search, Tag, Pencil, X, Save } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  "grocery", "electronics", "fashion", "food", "medicine",
  "wedding", "concert", "conference", "birthday", "corporate", "other",
];

const categoryColors = {
  grocery:     { bg: "#d1fae5", color: "#059669" },
  electronics: { bg: "#dbeafe", color: "#2563eb" },
  fashion:     { bg: "#fce7f3", color: "#db2777" },
  food:        { bg: "#fef3c7", color: "#d97706" },
  medicine:    { bg: "#ede9fe", color: "#7c3aed" },
  wedding:     { bg: "#fce7f3", color: "#db2777" },
  concert:     { bg: "#ede9fe", color: "#7c3aed" },
  conference:  { bg: "#dbeafe", color: "#2563eb" },
  birthday:    { bg: "#fef3c7", color: "#d97706" },
  corporate:   { bg: "#d1fae5", color: "#059669" },
  other:       { bg: "#f1f5f9", color: "#64748b" },
};

const EMPTY_FORM = { name: "", email: "", password: "", category: "" };

export default function ManageVendors() {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [userName, setUserName] = useState("Admin");

  // form mode: null | "add" | "edit"
  const [mode, setMode]     = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/vendors");
      setVendors(Array.isArray(res.data) ? res.data : res.data?.vendors || []);
    } catch { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("add");
  };

  const openEdit = (v) => {
    setForm({ name: v.name || "", email: v.email || "", password: "", category: v.category || "" });
    setEditId(v._id);
    setMode("edit");
  };

  const closeForm = () => { setMode(null); setEditId(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.category)
      return toast.error("Name, email and category are required");
    if (mode === "add" && !form.password)
      return toast.error("Password is required");

    try {
      setSaving(true);
      if (mode === "add") {
        await API.post("/admin/vendors", { ...form, role: "vendor" });
        toast.success("Vendor added successfully");
      } else {
        const payload = { name: form.name, email: form.email, category: form.category };
        if (form.password) payload.password = form.password;
        await API.put(`/admin/vendors/${editId}`, payload);
        toast.success("Vendor updated successfully");
      }
      closeForm();
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try { await API.delete(`/admin/vendors/${id}`); toast.success("Vendor deleted"); fetchVendors(); }
    catch { toast.error("Delete failed"); }
  };

  const filtered = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" userName={userName}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Maintain Vendor</h2>
          <p className="text-slate-500 text-sm">{vendors.length} registered vendors</p>
        </div>
        <button onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <UserPlus size={16} /> Add Vendor
        </button>
      </div>

      {/* Add / Edit Form */}
      {mode && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">
              {mode === "add" ? "Add New Vendor" : "Edit Vendor"}
            </h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Vendor Name *
              </label>
              <input type="text" placeholder="Vendor Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address *
              </label>
              <input type="email" placeholder="vendor@example.com" value={form.email}
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
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Category *
              </label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition">
                <option value="">Select Category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
              <Save size={15} />
              {saving ? "Saving..." : mode === "add" ? "Add Vendor" : "Save Changes"}
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
          <input placeholder="Search vendors by name, email or category..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Store size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No vendors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Vendor", "Email", "Category", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(v => {
                  const cc = categoryColors[v.category] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <tr key={v._id} className={`hover:bg-slate-50 transition ${editId === v._id ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
                            {v.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{v.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ background: cc.bg, color: cc.color }}>
                          <Tag size={10} />{v.category || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(v)}
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition"
                            title="Edit vendor">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(v._id, v.name)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                            title="Delete vendor">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
