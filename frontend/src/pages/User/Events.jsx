import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Users, Search } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["all", "wedding", "concert", "conference", "birthday", "corporate", "other"];

const catColors = {
  wedding: { bg: "#fce7f3", color: "#db2777" },
  concert: { bg: "#ede9fe", color: "#7c3aed" },
  conference: { bg: "#dbeafe", color: "#2563eb" },
  birthday: { bg: "#fef3c7", color: "#d97706" },
  corporate: { bg: "#d1fae5", color: "#059669" },
  other: { bg: "#f1f5f9", color: "#64748b" },
};

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };

export default function UserEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchEvents();
  }, [category]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: "upcoming" });
      if (category !== "all") params.append("category", category);
      const res = await API.get(`/events?${params}`);
      setEvents(res.data || []);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="user" userName={userName}>
      {/* Hero */}
      <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)" }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="w-64 h-64 rounded-full border-4 border-white absolute -top-16 -right-16" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Discover Events 🎉</h2>
        <p className="text-indigo-200 text-sm">Find and book amazing events near you</p>
        <div className="mt-4 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input placeholder="Search events, locations..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/30" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
              category === cat
                ? "text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
            }`}
            style={category === cat ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}>
            {cat === "all" ? "🌟 All" : `${catEmoji[cat] || "🎉"} ${cat}`}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CalendarDays size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No events found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(event => {
            const cc = catColors[event.category] || catColors.other;
            const available = event.capacity - (event.bookedCount || 0);
            return (
              <div key={event._id} className="card overflow-hidden hover:shadow-xl transition group cursor-pointer"
                onClick={() => navigate(`/user/events/${event._id}`)}>
                {/* Image / Banner */}
                <div className="h-44 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${cc.color}22, ${cc.color}44)` }}>
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                      {catEmoji[event.category] || "🎉"}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ background: cc.bg, color: cc.color }}>
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {available > 0 ? `${available} seats` : "Full"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{event.description}</p>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={13} className="text-indigo-400 shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={13} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users size={13} className="text-indigo-400 shrink-0" />
                      <span>{event.bookedCount || 0} / {event.capacity} booked</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-indigo-600 font-bold text-lg">
                      {event.price > 0 ? `₹${event.price}` : "Free"}
                    </span>
                    <button className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold"
                      onClick={e => { e.stopPropagation(); navigate(`/user/events/${event._id}`); }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
