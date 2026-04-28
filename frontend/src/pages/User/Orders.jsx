import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Package, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try { setLoading(true); const res = await API.get("/orders"); setOrders(res.data?.orders || res.data || []); }
    catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  const statusStyle = {
    delivered: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-red-50 text-red-600",
    pending: "bg-amber-50 text-amber-600",
  };

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
        <p className="text-slate-500 text-sm">{orders.length} orders placed</p>
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
          {orders.map((order, i) => (
            <div key={order._id} className="card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Package size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Order #{i + 1}</p>
                    <p className="text-slate-400 text-xs font-mono">{order._id?.slice(-12)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-indigo-600 text-lg">₹{order.totalAmount || 0}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[order.status] || statusStyle.pending}`}>
                    {order.status || "pending"}
                  </span>
                </div>
              </div>
              {order.products?.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {order.products.map((item, j) => (
                      <span key={j} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {item.productId?.name || "Product"} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
