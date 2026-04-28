import { useEffect, useState } from "react";
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function TransactionPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Vendor");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/vendor/orders");
      setOrders(res.data?.orders || res.data || []);
    } catch { toast.error("Failed to load transactions"); }
    finally { setLoading(false); }
  };

  const total = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const delivered = orders.filter(o => (o.status || "").toLowerCase() === "delivered")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pending = orders.filter(o => (o.status || "").toLowerCase() === "pending")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const cancelled = orders.filter(o => (o.status || "").toLowerCase() === "cancelled")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Build monthly chart data from orders
  const monthMap = {};
  orders.forEach(o => {
    if (!o.createdAt) return;
    const month = new Date(o.createdAt).toLocaleString("en-IN", { month: "short" });
    monthMap[month] = (monthMap[month] || 0) + (o.totalAmount || 0);
  });
  const chartData = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

  const filtered = orders.filter(o =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    (o.userId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = {
    delivered: "bg-emerald-50 text-emerald-700",
    shipped: "bg-blue-50 text-blue-700",
    processing: "bg-indigo-50 text-indigo-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Transactions</h2>
        <p className="text-slate-500 text-sm">Your complete revenue overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `₹${total}`, icon: CreditCard, color: "#6366f1", bg: "#eef2ff", trend: "up" },
          { label: "Delivered", value: `₹${delivered}`, icon: TrendingUp, color: "#10b981", bg: "#d1fae5", trend: "up" },
          { label: "Pending", value: `₹${pending}`, icon: CreditCard, color: "#f59e0b", bg: "#fef3c7", trend: "neutral" },
          { label: "Cancelled", value: `₹${cancelled}`, icon: CreditCard, color: "#ef4444", bg: "#fee2e2", trend: "down" },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              {trend === "up" && <ArrowUpRight size={16} className="text-emerald-500" />}
              {trend === "down" && <ArrowDownRight size={16} className="text-red-400" />}
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue Trend</h3>
              <p className="text-slate-400 text-xs mt-0.5">Monthly revenue from orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2.5} fill="url(#txGrad)" dot={{ fill: "#6366f1", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Transaction History</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order ID", "Customer", "Amount", "Items", "Status", "Date"].map(h => (
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
                      {Array.isArray(o.products) ? o.products.length : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[(o.status || "pending").toLowerCase()] || statusStyle.pending}`}>
                        {o.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
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
