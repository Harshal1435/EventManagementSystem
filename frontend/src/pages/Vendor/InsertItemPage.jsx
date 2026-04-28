import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Trash2, Pencil, Search, Zap } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function InsertItemPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/vendor/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const active = products.filter(p => p.status === "active" || p.status === "available").length;

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Items", value: products.length, color: "#6366f1", bg: "#eef2ff" },
          { label: "Active", value: active, color: "#10b981", bg: "#d1fae5" },
          { label: "Inactive", value: products.length - active, color: "#f59e0b", bg: "#fef3c7" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Package size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Items</h2>
          <p className="text-slate-500 text-sm">{products.length} products in your store</p>
        </div>
        <button
          onClick={() => navigate("/vendor/add-item")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading items...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">No items found</p>
            <button
              onClick={() => navigate("/vendor/add-item")}
              className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add First Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Product", "Price", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 w-fit
                        ${item.status === "active" || item.status === "available"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"}`}>
                        <Zap size={10} />{item.status || "inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate("/vendor/add-item")}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
