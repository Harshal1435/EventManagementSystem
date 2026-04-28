import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, ShoppingCart, Search } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function VendorItems() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchProducts();
  }, [vendorId]);

  const fetchProducts = async () => {
    try { setLoading(true); const res = await API.get(`/user/vendor-products/${vendorId}`); setProducts(res.data || []); }
    catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  };

  const addToCart = async (productId) => {
    try { setAddingId(productId); await API.post("/cart", { productId, quantity: 1 }); toast.success("Added to cart 🛒"); }
    catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
    finally { setAddingId(null); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vendor Items</h2>
          <p className="text-slate-500 text-sm">{products.length} items available</p>
        </div>
        <button onClick={() => navigate("/user/cart")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <ShoppingCart size={15} /> View Cart
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading items...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div key={p._id} className="card p-5 flex flex-col hover:shadow-lg transition group">
              <div className="h-32 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center mb-4 group-hover:from-sky-100 transition">
                <Package size={32} className="text-sky-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
              <p className="text-indigo-600 font-bold text-lg mt-1">₹{p.price}</p>
              {p.status && (
                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full w-fit font-medium capitalize
                  ${p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {p.status}
                </span>
              )}
              <button onClick={() => addToCart(p._id)} disabled={addingId === p._id}
                className="mt-auto pt-4 w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <ShoppingCart size={14} />
                {addingId === p._id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
