import { useEffect, useState } from "react";
import { ClipboardList, Search, Package } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const statusStyle = {
  Pending:    "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped:    "bg-indigo-50 text-indigo-700",
  Delivered:  "bg-emerald-50 text-emerald-700",
  Cancelled:  "bg-red-50 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/orders/${id}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch { toast.error("Failed to update status"); }
  };

  const filtered = orders.filter(o =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    (o.userId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <DashboardLayout role="admin" userName={userName}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders",   value: orders.length },
          { label: "Pending",        value: orders.filter(o => o.status === "Pending").length },
          { label: "Delivered",      value: orders.filter(o => o.status === "Delivered").length },
          { label: "Total Revenue",  value: `₹${totalRevenue}` },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All Orders</h2>
          <p className="text-slate-500 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by order ID or customer..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Update", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((o, i) => (
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
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(o.products || []).slice(0, 2).map((item, j) => (
                          <span key={j} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                            {item.name || "Product"} ×{item.quantity}
                          </span>
                        ))}
                        {(o.products || []).length > 2 && (
                          <span className="text-slate-400 text-xs">+{o.products.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-indigo-600 text-xs">₹{o.totalAmount || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[o.status] || statusStyle.Pending}`}>
                        {o.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select value={o.status || "Pending"}
                        onChange={e => handleStatusChange(o._id, e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 appearance-none cursor-pointer">
                        {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
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
