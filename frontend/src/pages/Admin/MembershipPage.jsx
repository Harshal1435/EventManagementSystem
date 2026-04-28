import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard, Plus, Trash2, Calendar } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function MembershipPage() {
  const [params] = useSearchParams();
  const vendorIdFromURL = params.get("vendorId");
  const [vendors, setVendors] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [userName, setUserName] = useState("Admin");
  const [form, setForm] = useState({ vendorId: vendorIdFromURL || "", type: "6months", startDate: "", endDate: "" });

  const calcEnd = (start, type) => {
    if (!start) return "";
    const d = new Date(start);
    if (type === "6months") d.setMonth(d.getMonth() + 6);
    if (type === "1year") d.setFullYear(d.getFullYear() + 1);
    if (type === "2years") d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    API.get("/admin/vendors").then(r => setVendors(Array.isArray(r.data) ? r.data : r.data?.vendors || [])).catch(() => {});
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await API.get("/admin/memberships");
      setMemberships(Array.isArray(res.data) ? res.data : res.data?.memberships || []);
    } catch { toast.error("Failed to load memberships"); }
  };

  const submit = async () => {
    if (!form.vendorId || !form.startDate) return toast.error("Fill all fields");
    try {
      await API.post("/admin/memberships", form);
      toast.success("Membership added");
      setForm({ vendorId: "", type: "6months", startDate: "", endDate: "" });
      fetchMemberships();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete membership?")) return;
    try { await API.delete(`/admin/memberships/${id}`); toast.success("Deleted"); fetchMemberships(); }
    catch { toast.error("Delete failed"); }
  };

  const typeLabels = { "6months": "6 Months", "1year": "1 Year", "2years": "2 Years" };
  const typeColors = { "6months": { bg: "#dbeafe", color: "#2563eb" }, "1year": { bg: "#d1fae5", color: "#059669" }, "2years": { bg: "#ede9fe", color: "#7c3aed" } };

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Memberships</h2>
          <p className="text-slate-500 text-sm">Manage vendor membership plans</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card p-6 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Plus size={16} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800">Add Membership</h3>
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Plan Type</label>
              <select value={form.type} onChange={e => { const t = e.target.value; setForm({ ...form, type: t, endDate: calcEnd(form.startDate, t) }); }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start Date</label>
              <input type="date" value={form.startDate}
                onChange={e => { const s = e.target.value; setForm({ ...form, startDate: s, endDate: calcEnd(s, form.type) }); }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">End Date (auto)</label>
              <input type="date" value={form.endDate} readOnly
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
            </div>
            <button onClick={submit} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">
              Save Membership
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">Active Memberships</h3>
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded-full">{memberships.length}</span>
          </div>
          {memberships.length === 0 ? (
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
                        {m.vendorId?.name?.charAt(0)?.toUpperCase() || "V"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{m.vendorId?.name || "Vendor"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar size={11} className="text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {m.startDate ? new Date(m.startDate).toLocaleDateString() : "—"} → {m.endDate ? new Date(m.endDate).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: tc.bg, color: tc.color }}>
                        {typeLabels[m.type] || m.type}
                      </span>
                      <button onClick={() => handleDelete(m._id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                        <Trash2 size={14} />
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
