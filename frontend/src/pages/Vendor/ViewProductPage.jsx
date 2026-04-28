import { useEffect, useState } from "react";
import { Package, Zap } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ViewProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Vendor");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try { setLoading(true); const res = await API.get("/vendor/products"); setProducts(res.data.products || res.data || []); }
    catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Products</h2>
        <p className="text-slate-500 text-sm">{products.length} products in your store</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(p => (
            <div key={p._id} className="card p-5 hover:shadow-lg transition">
              <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-4">
                <Package size={32} className="text-indigo-300" />
              </div>
              <h3 className="font-bold text-slate-800">{p.name}</h3>
              <p className="text-indigo-600 font-bold text-lg mt-1">₹{p.price}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex items-center gap-1
                  ${p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Zap size={10} />{p.status || "inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
