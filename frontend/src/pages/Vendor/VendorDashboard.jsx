import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ClipboardList, CreditCard, TrendingUp, Zap,
  CalendarDays, Users, ArrowRight, ChevronRight, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Vendor");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    API.get("/vendor/products").then(r => setProducts(r.data || [])).catch(() => {});
    API.get("/vendor/orders").then(r => setOrders(r.data?.orders || r.data || [])).catch(() => {});
    API.get("/events/vendor/my").then(r => setEvents(r.data || [])).catch(() => {});
  }, []);

  const activeProducts = products.filter(p => p.status === "active" || p.status === "available").length;
  const pendingOrders = orders.filter(o => (o.status || "").toLowerCase() === "pending").length;
  const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const upcomingEvents = events.filter(e => e.status === "upcoming").length;
  const totalBookings = events.reduce((s, e) => s + (e.bookedCount || 0), 0);
  const eventRevenue = events.reduce((s, e) => s + (e.price * (e.bookedCount || 0)), 0);

  const statCards = [
    { label: "Total Products", value: products.length, icon: Package, color: "#6366f1", bg: "#eef2ff", path: "/vendor/view-product" },
    { label: "Active Products", value: activeProducts, icon: Zap, color: "#10b981", bg: "#d1fae5", path: "/vendor/product-status" },
    { label: "My Events", value: events.length, icon: CalendarDays, color: "#8b5cf6", bg: "#f5f3ff", path: "/vendor/events" },
    { label: "Upcoming Events", value: upcomingEvents, icon: CalendarDays, color: "#0ea5e9", bg: "#e0f2fe", path: "/vendor/events" },
    { label: "Total Orders", value: orders.length, icon: ClipboardList, color: "#f59e0b", bg: "#fef3c7", path: "/vendor/orders" },
    { label: "Pending Orders", value: pendingOrders, icon: ClipboardList, color: "#ef4444", bg: "#fee2e2", path: "/vendor/orders" },
    { label: "Event Bookings", value: totalBookings, icon: Users, color: "#ec4899", bg: "#fce7f3", path: "/vendor/events" },
    { label: "Total Revenue", value: `₹${revenue + eventRevenue}`, icon: CreditCard, color: "#10b981", bg: "#d1fae5", path: "/vendor/transaction" },
  ];

  // Weekly bar chart data (last 7 days placeholder)
  const weekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    orders: orders.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    bookings: totalBookings > 0 ? Math.floor(Math.random() * 3) + 1 : 0,
  }));

  // Pie chart for product status
  const pieData = [
    { name: "Active", value: activeProducts || 0 },
    { name: "Inactive", value: (products.length - activeProducts) || 0 },
  ].filter(d => d.value > 0);

  // Recent events
  const recentEvents = events.slice(0, 3);

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6)" }}>
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 pointer-events-none">
          <div className="w-72 h-72 rounded-full border-4 border-white absolute -top-20 -right-20" />
          <div className="w-48 h-48 rounded-full border-4 border-white absolute top-10 right-10" />
        </div>
        <p className="text-sky-200 text-sm font-medium mb-1">Welcome back,</p>
        <h2 className="text-3xl font-bold">{userName} 🏪</h2>
        <p className="text-sky-200 text-sm mt-2">Manage your products, events, and track your revenue.</p>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-sky-300" />
            <span className="text-sky-200 text-xs">{pendingOrders} pending orders</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-sky-300" />
            <span className="text-sky-200 text-xs">{upcomingEvents} upcoming events</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={() => navigate("/vendor/events/create")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
            <CalendarDays size={13} /> Create Event
          </button>
          <button onClick={() => navigate("/vendor/add-item")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
            <Package size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className="stat-card text-left group hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Weekly Activity</h3>
              <p className="text-slate-400 text-xs mt-0.5">Orders & bookings this week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookings" name="Bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-1">Product Status</h3>
          <p className="text-slate-400 text-xs mb-4">Active vs Inactive</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-300 text-sm">No products yet</div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Recent Events</h3>
              <p className="text-slate-400 text-xs mt-0.5">Your latest created events</p>
            </div>
            <button onClick={() => navigate("/vendor/events")}
              className="text-indigo-600 text-xs font-semibold hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentEvents.map(event => (
              <div key={event._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition cursor-pointer"
                onClick={() => navigate("/vendor/events")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
                    {event.category === "wedding" ? "💍" : event.category === "concert" ? "🎵" : event.category === "conference" ? "🏢" : "🎉"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{event.title}</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {event.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-600 font-bold text-sm">{event.price > 0 ? `₹${event.price}` : "Free"}</p>
                  <p className="text-slate-400 text-xs">{event.bookedCount || 0}/{event.capacity} booked</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
