import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ClipboardList, Store, ChevronRight, CalendarDays, Ticket, Sparkles, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };
const catGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #10b981, #0ea5e9)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [categories, setCategories] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    API.get("/user/categories").then(r => setCategories(r.data || [])).catch(() => {});
    API.get("/events?status=upcoming").then(r => setUpcomingEvents((r.data || []).slice(0, 3))).catch(() => {});
    API.get("/bookings/my").then(r => setBookingCount((r.data || []).length)).catch(() => {});
    API.get("/cart").then(r => {
      const items = r.data?.cart?.items || r.data?.items || (Array.isArray(r.data) ? r.data : []);
      setCartCount(items.length);
    }).catch(() => {});
  }, []);

  const quickLinks = [
    { label: "Browse Events", icon: CalendarDays, path: "/user/events", color: "#6366f1", bg: "#eef2ff", desc: "Discover upcoming events" },
    { label: "My Bookings", icon: Ticket, path: "/user/bookings", color: "#8b5cf6", bg: "#f5f3ff", badge: bookingCount, desc: "View your tickets" },
    { label: "My Cart", icon: ShoppingCart, path: "/user/cart", color: "#0ea5e9", bg: "#e0f2fe", badge: cartCount, desc: "Items waiting" },
    { label: "My Orders", icon: ClipboardList, path: "/user/orders", color: "#10b981", bg: "#d1fae5", desc: "Track your orders" },
  ];

  return (
    <DashboardLayout role="user" userName={userName}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)" }}>
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 pointer-events-none">
          <div className="w-72 h-72 rounded-full border-4 border-white absolute -top-20 -right-20" />
          <div className="w-48 h-48 rounded-full border-4 border-white absolute top-10 right-10" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-pink-200" />
          <p className="text-pink-200 text-sm font-medium">Welcome back,</p>
        </div>
        <h2 className="text-3xl font-bold">{userName} 🎉</h2>
        <p className="text-indigo-100 text-sm mt-2">Discover events, book tickets, and manage your experience.</p>
        <button onClick={() => navigate("/user/events")}
          className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
          Browse Events <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map(({ label, icon: Icon, path, color, bg, badge, desc }) => (
          <button key={path} onClick={() => navigate(path)}
            className="stat-card text-left flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition shrink-0" />
          </button>
        ))}
      </div>

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Upcoming Events</h3>
            <button onClick={() => navigate("/user/events")}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <div key={event._id} className="card p-4 hover:shadow-md transition cursor-pointer group"
                onClick={() => navigate(`/user/events/${event._id}`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-50">
                    {catEmoji[event.category] || "🎉"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition">{event.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{event.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <span className="text-indigo-600 font-bold text-sm">
                    {event.price > 0 ? `₹${event.price}` : "Free"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor Categories */}
      {categories.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Store size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">Browse Vendors by Category</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat, i) => (
              <button key={cat} onClick={() => navigate(`/user/vendors/${cat.toLowerCase()}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: catGradients[i % catGradients.length] }}>
                  {cat.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-600 capitalize group-hover:text-indigo-600 transition">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
