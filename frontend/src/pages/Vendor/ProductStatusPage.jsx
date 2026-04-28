import { useEffect, useState } from "react";
import { Zap, Package } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ProductStatusPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Vendor");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try { setLoading(true); const res = await API.get("/vendor/products"); setProducts(res.data || []); }
    catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, current) => {
    const next = current === "active" ? "inactive" : "active";
    try { await API.patch(`/vendor/products/${id}/status`, { status: next }); toast.success(`Set to ${next}`); fetchProducts(); }
    catch { toast.error("Failed to update status"); }
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Product Status</h2>
        <p className="text-slate-500 text-sm">Toggle product visibility</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Zap size={16} className="text-indigo-500" />
          <h3 className="font-bold text-slate-800">All Products</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No products found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {products.map(p => (
              <div key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Package size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                    <p className="text-indigo-600 text-sm font-semibold">₹{p.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {p.status || "inactive"}
                  </span>
                  <button onClick={() => toggleStatus(p._id, p.status)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition
                      ${p.status === "active" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "btn-primary"}`}>
                    {p.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
