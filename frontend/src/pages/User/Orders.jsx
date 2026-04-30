import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Package, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle, Clock, Truck, XCircle, ShoppingBag,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

// Status timeline steps
const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

const statusConfig = {
  Pending:    { color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock       },
  Processing: { color: "#6366f1", bg: "bg-indigo-50",  text: "text-indigo-700",  icon: Package     },
  Shipped:    { color: "#0ea5e9", bg: "bg-sky-50",     text: "text-sky-700",     icon: Truck       },
  Delivered:  { color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  Cancelled:  { color: "#ef4444", bg: "bg-red-50",     text: "text-red-700",     icon: XCircle     },
};

function StatusTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <XCircle size={14} className="text-red-500" />
        <span className="text-xs text-red-600 font-medium">Order Cancelled</span>
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {STATUS_STEPS.map((s, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition ${
              active  ? "bg-indigo-600 text-white" :
              done    ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-400"
            }`}>
              {done && !active && <CheckCircle size={9} />}
              {s}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`w-4 h-0.5 ${i < currentIdx ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [userName, setUserName]   = useState("User");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders");
      setOrders(res.data?.orders || res.data || []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  // Stats
  const stats = [
    { label: "Total",      value: orders.length,                                          color: "#6366f1" },
    { label: "Pending",    value: orders.filter(o => o.status === "Pending").length,      color: "#f59e0b" },
    { label: "Delivered",  value: orders.filter(o => o.status === "Delivered").length,    color: "#10b981" },
    { label: "Cancelled",  value: orders.filter(o => o.status === "Cancelled").length,    color: "#ef4444" },
  ];

  return (
    <DashboardLayout role="user" userName={userName}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Order Status</h2>
          <p className="text-slate-500 text-sm">{orders.length} orders placed</p>
        </div>
        <button onClick={() => navigate("/user/cart")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <ShoppingBag size={15} /> Shop More
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="stat-card !p-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardList size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">No orders yet</p>
          <p className="text-slate-400 text-sm mb-6">Start shopping to see your orders here</p>
          <button onClick={() => navigate("/user/products")}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            Shop Now <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const cfg      = statusConfig[order.status] || statusConfig.Pending;
            const StatusIcon = cfg.icon;
            const expanded = expandedId === order._id;

            return (
              <div key={order._id} className="card overflow-hidden">
                {/* Order header — always visible */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <StatusIcon size={20} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Order #{i + 1}</p>
                      <p className="text-slate-400 text-xs font-mono">{order._id?.slice(-12)}</p>
                      {order.createdAt && (
                        <p className="text-slate-400 text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 text-lg">₹{order.totalAmount || 0}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <StatusIcon size={10} />
                        {order.status || "Pending"}
                      </span>
                    </div>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Check Status — expanded detail */}
                {expanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/40">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Check Status</p>

                    {/* Timeline */}
                    <StatusTimeline status={order.status || "Pending"} />

                    {/* Products */}
                    {order.products?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items</p>
                        <div className="space-y-2">
                          {order.products.map((item, j) => (
                            <div key={j} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                  <Package size={14} className="text-indigo-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{item.name || "Product"}</p>
                                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-semibold text-slate-700 text-sm">₹{(item.price || 0) * (item.quantity || 1)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total breakdown */}
                    <div className="mt-4 bg-white rounded-xl p-4 border border-slate-100 space-y-1.5 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span><span>₹{order.totalAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery</span><span className="text-emerald-600">Free</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-1.5">
                        <span>Total Paid</span>
                        <span className="text-indigo-600">₹{order.totalAmount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
