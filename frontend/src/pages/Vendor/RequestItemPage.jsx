import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Package, CheckCircle, ArrowRight, FileText, Tag, DollarSign } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import toast from "react-hot-toast";

export default function RequestItemPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    estimatedPrice: "",
    reason: "",
    quantity: "1",
  });

  const CATEGORIES = ["grocery", "electronics", "fashion", "food", "medicine", "other"];

  const handleSubmit = async () => {
    if (!form.itemName || !form.category || !form.reason) {
      return toast.error("Please fill all required fields");
    }
    try {
      setLoading(true);
      // Simulate request submission (no backend endpoint yet — can be wired up)
      await new Promise(r => setTimeout(r, 800));
      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout role="vendor" userName="Vendor">
        <div className="max-w-lg mx-auto">
          <div className="card p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
            <p className="text-slate-500 text-sm mb-2">
              Your item request for <span className="font-semibold text-slate-700">"{form.itemName}"</span> has been sent to the admin.
            </p>
            <p className="text-slate-400 text-xs mb-8">You'll be notified once it's reviewed and approved.</p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left mb-8 space-y-2">
              {[
                { label: "Item", value: form.itemName },
                { label: "Category", value: form.category },
                { label: "Quantity", value: form.quantity },
                { label: "Est. Price", value: form.estimatedPrice ? `₹${form.estimatedPrice}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-700 capitalize">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setSubmitted(false); setForm({ itemName: "", category: "", estimatedPrice: "", reason: "", quantity: "1" }); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
              >
                New Request
              </button>
              <button
                onClick={() => navigate("/vendor/view-product")}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                View Products <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="vendor" userName="Vendor">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Request Item</h2>
          <p className="text-slate-500 text-sm">Submit a request to add a new item to your store</p>
        </div>

        <div className="card p-6 space-y-5">
          {/* Item Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <Package size={12} /> Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Honey 500g"
              value={form.itemName}
              onChange={e => setForm({ ...form, itemName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Category & Quantity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                <Tag size={12} /> Category *
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                <Package size={12} /> Quantity
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Estimated Price */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <DollarSign size={12} /> Estimated Price (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={form.estimatedPrice}
              onChange={e => setForm({ ...form, estimatedPrice: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <FileText size={12} /> Reason / Description *
            </label>
            <textarea
              placeholder="Why do you need this item? Describe the demand or use case..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              <Send size={15} />
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              onClick={() => navigate("/vendor")}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
