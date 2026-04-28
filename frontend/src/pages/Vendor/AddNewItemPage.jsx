import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Package, X, ImagePlus, Loader } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function AddNewItemPage() {
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("Vendor");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const fileRef = useRef();

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try { const res = await API.get("/vendor/products"); setProducts(res.data || []); }
    catch { toast.error("Failed to load products"); }
  };

  const reset = () => { setForm({ name: "", price: "", image: "" }); setEditId(null); };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(true);
      const res = await API.post("/upload/product", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, image: res.data.url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Upload failed");
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) return toast.error("Fill all fields");
    try {
      setLoading(true);
      const payload = { name: form.name, price: Number(form.price), image: form.image };
      if (editId) { await API.put(`/vendor/products/${editId}`, payload); toast.success("Updated"); }
      else { await API.post("/vendor/products", payload); toast.success("Product added"); }
      reset(); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => { setEditId(p._id); setForm({ name: p.name || "", price: p.price || "", image: p.image || "" }); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await API.delete(`/vendor/products/${id}`); toast.success("Deleted"); fetchProducts(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products</h2>
          <p className="text-slate-500 text-sm">{products.length} products in your store</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card p-6 h-fit">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                {editId ? <Pencil size={14} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
              </div>
              <h3 className="font-bold text-slate-800">{editId ? "Edit Product" : "Add Product"}</h3>
            </div>
            {editId && <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>}
          </div>

          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Product Image</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleImageUpload(e.target.files[0])} />
              {form.image ? (
                <div className="relative rounded-xl overflow-hidden h-32 group">
                  <img src={form.image} alt="Product" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button onClick={() => fileRef.current.click()}
                      className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg">Change</button>
                    <button onClick={() => setForm(f => ({ ...f, image: "" }))}
                      className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current.click()} disabled={uploading}
                  className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition disabled:opacity-60">
                  {uploading ? <Loader size={18} className="text-indigo-400 animate-spin" /> : <ImagePlus size={20} className="text-slate-300" />}
                  <p className="text-slate-400 text-xs">{uploading ? "Uploading..." : "Click to upload"}</p>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Product Name</label>
              <input type="text" placeholder="e.g. Fresh Apples" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Price (₹)</label>
              <input type="number" placeholder="0.00" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <button onClick={handleSubmit} disabled={loading || uploading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
              {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Package size={16} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">My Products</h3>
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded-full">{products.length}</span>
          </div>
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No products yet. Add your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {products.map(p => (
                <div key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                      <p className="text-indigo-600 text-sm font-semibold">₹{p.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${p.status === "active" || p.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {p.status || "inactive"}
                    </span>
                    <button onClick={() => handleEdit(p)}
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
