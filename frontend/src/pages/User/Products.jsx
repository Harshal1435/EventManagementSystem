import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Package, ShoppingCart, Search,
  ArrowLeft, Tag, ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

// ── gradient palette for vendor avatars ──────────────────
const GRADIENTS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #10b981, #0ea5e9)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
];

const catColors = {
  grocery:     { bg: "#d1fae5", color: "#059669" },
  electronics: { bg: "#dbeafe", color: "#2563eb" },
  fashion:     { bg: "#fce7f3", color: "#db2777" },
  food:        { bg: "#fef3c7", color: "#d97706" },
  medicine:    { bg: "#ede9fe", color: "#7c3aed" },
  wedding:     { bg: "#fce7f3", color: "#db2777" },
  concert:     { bg: "#ede9fe", color: "#7c3aed" },
  conference:  { bg: "#dbeafe", color: "#2563eb" },
  birthday:    { bg: "#fef3c7", color: "#d97706" },
  corporate:   { bg: "#d1fae5", color: "#059669" },
  other:       { bg: "#f1f5f9", color: "#64748b" },
};

export default function Products() {
  const navigate = useNavigate();

  // ── view state: "vendors" | "products" ───────────────
  const [view, setView]             = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState(null);

  // ── data ─────────────────────────────────────────────
  const [vendors, setVendors]       = useState([]);
  const [products, setProducts]     = useState([]);
  const [loadingV, setLoadingV]     = useState(true);
  const [loadingP, setLoadingP]     = useState(false);
  const [addingId, setAddingId]     = useState(null);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [userName, setUserName]     = useState("User");

  // ── load all vendors on mount ─────────────────────────
  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoadingV(true);
      const res = await API.get("/user/vendors");          // user-accessible endpoint
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load vendors"); }
    finally { setLoadingV(false); }
  };

  // ── when user picks a vendor ──────────────────────────
  const selectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setView("products");
    setSearch("");
    try {
      setLoadingP(true);
      const res = await API.get(`/user/vendor-products/${vendor._id}`);
      setProducts(res.data || []);
    } catch { toast.error("Failed to load products"); setProducts([]); }
    finally { setLoadingP(false); }
  };

  const backToVendors = () => {
    setView("vendors");
    setSelectedVendor(null);
    setProducts([]);
    setSearch("");
  };

  const addToCart = async (productId) => {
    try {
      setAddingId(productId);
      await API.post("/cart", { productId, quantity: 1 });
      toast.success("Added to cart 🛒");
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
    finally { setAddingId(null); }
  };

  // ── derived lists ─────────────────────────────────────
  const categories = ["all", ...new Set(vendors.map(v => v.category).filter(Boolean))];

  const filteredVendors = vendors.filter(v => {
    const matchSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────
  // RENDER — VENDOR LIST
  // ─────────────────────────────────────────────────────
  if (view === "vendors") {
    return (
      <DashboardLayout role="user" userName={userName}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Select a Vendor</h2>
            <p className="text-slate-500 text-sm">
              Choose a vendor to browse their products
            </p>
          </div>
          <button onClick={() => navigate("/user/cart")}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <ShoppingCart size={15} /> View Cart
          </button>
        </div>

        {/* Search + Category filter */}
        <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search vendors by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none min-w-[150px]"
          >
            {categories.map(c => (
              <option key={c} value={c} className="capitalize">
                {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor grid */}
        {loadingV ? (
          <div className="text-center py-16 text-slate-400">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="card p-16 text-center">
            <Store size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No vendors found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVendors.map((vendor, i) => {
              const cc = catColors[vendor.category] || catColors.other;
              return (
                <button
                  key={vendor._id}
                  onClick={() => selectVendor(vendor)}
                  className="card p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition group w-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                      style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                    >
                      {vendor.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">
                        {vendor.name}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{vendor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {vendor.category ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: cc.bg, color: cc.color }}
                      >
                        <Tag size={10} />
                        {vendor.category}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                      Browse Products <ChevronRight size={13} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER — PRODUCT LIST for selected vendor
  // ─────────────────────────────────────────────────────
  return (
    <DashboardLayout role="user" userName={userName}>
      {/* Back + header */}
      <button
        onClick={backToVendors}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-5 transition"
      >
        <ArrowLeft size={16} /> Back to Vendors
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Vendor mini-card */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: GRADIENTS[0] }}
          >
            {selectedVendor?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{selectedVendor?.name}</h2>
            <p className="text-slate-500 text-sm capitalize">
              {selectedVendor?.category || "Vendor"} · {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button onClick={() => navigate("/user/cart")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <ShoppingCart size={15} /> View Cart
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder={`Search ${selectedVendor?.name}'s products...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>
      </div>

      {/* Products */}
      {loadingP ? (
        <div className="text-center py-16 text-slate-400">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">
            {products.length === 0
              ? `${selectedVendor?.name} has no products yet`
              : "No products match your search"}
          </p>
          {products.length === 0 && (
            <button onClick={backToVendors}
              className="mt-4 btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
              <ArrowLeft size={14} /> Choose Another Vendor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map(p => (
            <div key={p._id} className="card p-5 flex flex-col hover:shadow-lg transition group">
              {/* Product image placeholder */}
              <div className="h-36 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-4 group-hover:from-indigo-100 transition">
                <Package size={36} className="text-indigo-300" />
              </div>

              <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
              <p className="text-indigo-600 font-bold text-lg mt-1">₹{p.price}</p>

              {p.status && (
                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full w-fit font-medium capitalize ${
                  p.status === "active" || p.status === "available"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}>
                  {p.status}
                </span>
              )}

              <button
                onClick={() => addToCart(p._id)}
                disabled={addingId === p._id}
                className="mt-auto pt-4 w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={15} />
                {addingId === p._id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
