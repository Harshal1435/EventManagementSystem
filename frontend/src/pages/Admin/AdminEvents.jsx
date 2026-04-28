import { useEffect, useState } from "react";
import { CalendarDays, Trash2, Search, MapPin, Users } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };
const statusStyle = {
  upcoming: "bg-emerald-50 text-emerald-700",
  ongoing: "bg-blue-50 text-blue-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/admin/all");
      setEvents(res.data || []);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/admin/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.vendorId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalBookings = events.reduce((s, e) => s + (e.bookedCount || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + (e.price * (e.bookedCount || 0)), 0);

  return (
    <DashboardLayout role="admin" userName={userName}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Events", value: events.length },
          { label: "Upcoming", value: events.filter(e => e.status === "upcoming").length },
          { label: "Total Bookings", value: totalBookings },
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
          <h2 className="text-xl font-bold text-slate-800">All Events</h2>
          <p className="text-slate-500 text-sm">{events.length} events on platform</p>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search events, vendors, locations..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Event", "Organizer", "Date", "Location", "Bookings", "Revenue", "Status", "Action"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(e => (
                  <tr key={e._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{catEmoji[e.category] || "🎉"}</span>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{e.title}</p>
                          <p className="text-xs text-slate-400 capitalize">{e.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{e.vendorId?.name || "—"}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-[120px] truncate">{e.location}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{e.bookedCount || 0}/{e.capacity}</td>
                    <td className="px-5 py-4 font-semibold text-indigo-600 text-xs">₹{e.price * (e.bookedCount || 0)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[e.status] || statusStyle.upcoming}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(e._id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                        <Trash2 size={13} />
                      </button>
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
