import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Store, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const gradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #10b981, #0ea5e9)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
];

export default function CategoryVendors() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchVendors();
  }, [category]);

  const fetchVendors = async () => {
    try { setLoading(true); const res = await API.get(`/user/vendors/${category}`); setVendors(res.data || []); }
    catch { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 capitalize">{category} Vendors</h2>
        <p className="text-slate-500 text-sm">{vendors.length} vendors in this category</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="card p-16 text-center">
          <Store size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No vendors in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((vendor, i) => (
            <div key={vendor._id} className="card p-6 hover:shadow-lg transition group">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                  style={{ background: gradients[i % gradients.length] }}>
                  {vendor.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{vendor.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{vendor.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full capitalize">
                  {vendor.category || category}
                </span>
                <button onClick={() => navigate(`/user/vendor-items/${vendor._id}`)}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold">
                  Shop <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
