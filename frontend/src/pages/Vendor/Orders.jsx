import { useEffect, useState } from "react";
import { ClipboardList, Search, RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyle = {
  delivered: "bg-emerald-50 text-emerald-700",
  shipped: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [userName, setUserName] = useState("Vendor");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/vendor/orders");
      setOrders(res.data?.orders || res.data || []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update status");
    } finally { setUpdatingId(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      (o.userId?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (o.status || "").toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => (o.status || "").toLowerCase() === "pending").length;
  const deliveredCount = orders.filter(o => (o.status || "").toLowerCase() === "delivered").length;

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length, color: "#6366f1", bg: "#eef2ff" },
          { label: "Pending", value: pendingCount, color: "#f59e0b", bg: "#fef3c7" },
          { label: "Delivered", value: deliveredCount, color: "#10b981", bg: "#d1fae5" },
          { label: "Revenue", value: `₹${totalRevenue}`, color: "#0ea5e9", bg: "#e0f2fe" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <ClipboardList size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Orders</h2>
          <p className="text-slate-500 text-sm">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none min-w-[140px]"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order ID", "Customer", "Amount", "Items", "Status", "Update Status"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">#{o._id?.slice(-8)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {(o.userId?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-xs">{o.userId?.name || "User"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-indigo-600">₹{o.totalAmount || 0}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {Array.isArray(o.products) ? o.products.length : "—"} item{Array.isArray(o.products) && o.products.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[(o.status || "pending").toLowerCase()] || statusStyle.pending}`}>
                        {o.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={o.status || "Pending"}
                        disabled={updatingId === o._id}
                        onChange={e => handleStatusUpdate(o._id, e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
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
