import { useEffect, useState } from "react";
import { Store, UserPlus, Trash2, Search, Tag } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["grocery", "electronics", "fashion", "food", "medicine",
  "wedding", "concert", "conference", "birthday", "corporate", "other"];

const categoryColors = {
  grocery: { bg: "#d1fae5", color: "#059669" },
  electronics: { bg: "#dbeafe", color: "#2563eb" },
  fashion: { bg: "#fce7f3", color: "#db2777" },
  food: { bg: "#fef3c7", color: "#d97706" },
  medicine: { bg: "#ede9fe", color: "#7c3aed" },
};

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name: "", email: "", password: "", category: "" });
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try { setLoading(true);
      const res = await API.get("/admin/vendors");
      setVendors(Array.isArray(res.data) ? res.data : res.data?.vendors || []);
    } catch { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password || !form.category) return toast.error("Fill all fields");
    try {
      await API.post("/admin/vendors", { ...form, role: "vendor" });
      toast.success("Vendor added");
      setForm({ name: "", email: "", password: "", category: "" });
      setTab("list");
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try { await API.delete(`/admin/vendors/${id}`); toast.success("Deleted"); fetchVendors(); }
    catch { toast.error("Delete failed"); }
  };

  const filtered = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vendor Management</h2>
          <p className="text-slate-500 text-sm">{vendors.length} registered vendors</p>
        </div>
        <button onClick={() => setTab(tab === "add" ? "list" : "add")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <UserPlus size={16} />
          {tab === "add" ? "View List" : "Add Vendor"}
        </button>
      </div>

      {/* Add Form */}
      {tab === "add" && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-5">Add New Vendor</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "name", placeholder: "Vendor Name", type: "text" },
              { key: "email", placeholder: "Email Address", type: "email" },
              { key: "password", placeholder: "Password", type: "password" },
            ].map(({ key, placeholder, type }) => (
              <input key={key} type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
            ))}
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">Add Vendor</button>
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
          <input placeholder="Search vendors by name, email or category..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
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
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Vendor</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(v => {
                  const cat = categoryColors[v.category] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <tr key={v._id} className="hover:bg-slate-50 transition">
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
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ background: cat.bg, color: cat.color }}>
                          <Tag size={10} className="inline mr-1" />{v.category || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(v._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                          <Trash2 size={14} />
                        </button>
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
