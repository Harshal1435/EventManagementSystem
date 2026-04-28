import { useEffect, useState } from "react";
import { CreditCard, Plus, Pencil, Trash2, Calendar, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function VendorMembership() {
  const [memberships, setMemberships] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ vendorId: "", type: "6months", startDate: "", endDate: "" });

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try { setLoading(true);
      const [m, v] = await Promise.all([
        API.get("/admin/memberships").catch(() => ({ data: [] })),
        API.get("/admin/vendors").catch(() => ({ data: [] })),
      ]);
      setMemberships(Array.isArray(m.data) ? m.data : m.data?.memberships || []);
      setVendors(Array.isArray(v.data) ? v.data : v.data?.vendors || []);
    } finally { setLoading(false); }
  };

  const reset = () => { setForm({ vendorId: "", type: "6months", startDate: "", endDate: "" }); setEditId(null); };

  const handleSubmit = async () => {
    if (!form.vendorId || !form.startDate || !form.endDate) return toast.error("Fill all fields");
    try {
      if (editId) { await API.put(`/admin/memberships/${editId}`, form); toast.success("Updated"); }
      else { await API.post("/admin/memberships", form); toast.success("Added"); }
      reset(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
  };

  const handleEdit = (m) => {
    setEditId(m._id);
    setForm({ vendorId: m.vendorId?._id || m.vendorId || "", type: m.type || "6months",
      startDate: m.startDate?.split("T")[0] || "", endDate: m.endDate?.split("T")[0] || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await API.delete(`/admin/memberships/${id}`); toast.success("Deleted"); fetchAll(); }
    catch { toast.error("Failed"); }
  };

  const typeColors = { "6months": { bg: "#dbeafe", color: "#2563eb" }, "1year": { bg: "#d1fae5", color: "#059669" }, "2years": { bg: "#ede9fe", color: "#7c3aed" } };
  const typeLabels = { "6months": "6 Months", "1year": "1 Year", "2years": "2 Years" };

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vendor Memberships</h2>
          <p className="text-slate-500 text-sm">Assign and manage vendor membership plans</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card p-6 h-fit">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                {editId ? <Pencil size={14} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
              </div>
              <h3 className="font-bold text-slate-800">{editId ? "Edit Membership" : "Add Membership"}</h3>
            </div>
            {editId && <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Vendor</label>
              <select value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Plan</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">End</label>
                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800" />
              </div>
            </div>
            <button onClick={handleSubmit}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">
              {editId ? "Update Membership" : "Add Membership"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">All Memberships</h3>
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded-full">{memberships.length}</span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : memberships.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No memberships yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {memberships.map(m => {
                const tc = typeColors[m.type] || { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <div key={m._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
                        {(m.vendorId?.name || "V").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{m.vendorId?.name || "Vendor"}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar size={10} className="text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {m.startDate ? new Date(m.startDate).toLocaleDateString() : "—"} → {m.endDate ? new Date(m.endDate).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: tc.bg, color: tc.color }}>
                        {typeLabels[m.type] || m.type}
                      </span>
                      <button onClick={() => handleEdit(m)}
                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(m._id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
