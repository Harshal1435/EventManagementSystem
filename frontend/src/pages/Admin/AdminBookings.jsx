import { useEffect, useState } from "react";
import { Ticket, Search } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const statusStyle = {
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
};
const payStyle = {
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-blue-50 text-blue-700",
  unpaid: "bg-red-50 text-red-700",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/admin/all");
      setBookings(res.data || []);
    } catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/bookings/admin/update/${id}`, { status });
      toast.success("Status updated");
      fetchBookings();
    } catch { toast.error("Failed"); }
  };

  const filtered = bookings.filter(b =>
    b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.eventId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.totalPrice || 0), 0);

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length },
          { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length },
          { label: "Revenue", value: `₹${totalRevenue}` },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All Bookings</h2>
          <p className="text-slate-500 text-sm">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by user or event..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["User", "Event", "Seats", "Amount", "Payment", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {b.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{b.userId?.name || "User"}</p>
                          <p className="text-slate-400 text-xs">{b.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 text-xs font-medium max-w-[140px] truncate">
                      {b.eventId?.title || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{b.seats}</td>
                    <td className="px-5 py-4 font-bold text-indigo-600 text-xs">₹{b.totalPrice}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${payStyle[b.paymentStatus] || payStyle.unpaid}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select value={b.status}
                        onChange={e => handleStatusChange(b._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusStyle[b.status] || statusStyle.pending}`}>
                        {["confirmed", "pending", "cancelled"].map(s => (
                          <option key={s} value={s} className="bg-white text-slate-800 capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
