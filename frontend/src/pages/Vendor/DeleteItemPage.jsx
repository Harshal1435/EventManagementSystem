import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Trash2, Search, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function DeleteItemPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Vendor");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/vendor/products");
      setProducts(res.data.products || res.data || []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await API.delete(`/vendor/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${products.length} products? This cannot be undone.`)) return;
    try {
      await Promise.all(products.map(p => API.delete(`/vendor/products/${p._id}`)));
      toast.success("All products deleted");
      fetchProducts();
    } catch { toast.error("Some deletions failed"); fetchProducts(); }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Delete Items</h2>
          <p className="text-slate-500 text-sm">{products.length} products in your store</p>
        </div>
        {products.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition"
          >
            <Trash2 size={15} /> Delete All
          </button>
        )}
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-6">
        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-semibold text-sm">Caution</p>
          <p className="text-red-500 text-xs mt-0.5">Deleted products cannot be recovered. Make sure you want to remove them permanently.</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search products to delete..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No products found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(p => (
              <div key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-red-50/30 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition">
                    <Package size={18} className="text-slate-400 group-hover:text-red-400 transition" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-indigo-600 text-sm font-semibold">₹{p.price}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                        ${p.status === "active" || p.status === "available"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"}`}>
                        {p.status || "inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p._id, p.name)}
                  disabled={deletingId === p._id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {deletingId === p._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
