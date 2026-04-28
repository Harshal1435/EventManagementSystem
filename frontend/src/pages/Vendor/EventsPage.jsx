import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, Pencil, Trash2, Users, MapPin, Zap, BarChart3 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const statusStyle = {
  upcoming: "bg-emerald-50 text-emerald-700",
  ongoing: "bg-blue-50 text-blue-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-700",
};

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };

export default function VendorEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Vendor");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/vendor/my");
      setEvents(res.data || []);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.msg || "Delete failed"); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/events/${id}/status`, { status });
      toast.success("Status updated");
      fetchEvents();
    } catch { toast.error("Failed to update status"); }
  };

  const totalBookings = events.reduce((s, e) => s + (e.bookedCount || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + (e.price * (e.bookedCount || 0)), 0);

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Events", value: events.length, color: "#6366f1", bg: "#eef2ff" },
          { label: "Upcoming", value: events.filter(e => e.status === "upcoming").length, color: "#10b981", bg: "#d1fae5" },
          { label: "Total Bookings", value: totalBookings, color: "#0ea5e9", bg: "#e0f2fe" },
          { label: "Revenue", value: `₹${totalRevenue}`, color: "#f59e0b", bg: "#fef3c7" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Events</h2>
          <p className="text-slate-500 text-sm">{events.length} events created</p>
        </div>
        <button onClick={() => navigate("/vendor/events/create")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <Plus size={16} /> Create Event
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="card p-16 text-center">
          <CalendarDays size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">No events yet</p>
          <p className="text-slate-400 text-sm mb-6">Create your first event to get started</p>
          <button onClick={() => navigate("/vendor/events/create")}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <Plus size={14} /> Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {events.map(event => (
            <div key={event._id} className="card p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0">
                    {catEmoji[event.category] || "🎉"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{event.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays size={11} className="text-indigo-400" />
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {event.time}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} className="text-indigo-400" />
                        <span className="truncate max-w-[120px]">{event.location}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle[event.status] || statusStyle.upcoming}`}>
                        {event.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        <Users size={10} className="inline mr-1" />{event.bookedCount || 0}/{event.capacity}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {event.price > 0 ? `₹${event.price}` : "Free"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => navigate(`/vendor/events/${event._id}/edit`)}
                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => navigate(`/vendor/events/${event._id}/guests`)}
                    className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-500 flex items-center justify-center transition"
                    title="Manage Guest List">
                    <Users size={13} />
                  </button>
                  <button onClick={() => handleDelete(event._id)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Status change */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                {["upcoming", "ongoing", "completed", "cancelled"].map(s => (
                  <button key={s} onClick={() => handleStatusChange(event._id, s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition capitalize ${
                      event.status === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
