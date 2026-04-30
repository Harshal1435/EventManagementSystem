import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Store, CreditCard, ShoppingBag, TrendingUp,
  Activity, CalendarDays, Ticket, ChevronRight, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";

const areaData = [
  { month: "Jan", revenue: 2400, bookings: 12 },
  { month: "Feb", revenue: 3200, bookings: 18 },
  { month: "Mar", revenue: 2900, bookings: 15 },
  { month: "Apr", revenue: 4100, bookings: 24 },
  { month: "May", revenue: 3800, bookings: 20 },
  { month: "Jun", revenue: 5200, bookings: 32 },
];

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0, vendors: 0, orders: 0, memberships: 0,
    events: 0, bookings: 0, upcomingEvents: 0, totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [eventsByCategory, setEventsByCategory] = useState([]);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Admin")).catch(() => {});

    Promise.all([
      API.get("/admin/users").catch(() => ({ data: [] })),
      API.get("/admin/vendors").catch(() => ({ data: [] })),
      API.get("/admin/orders").catch(() => ({ data: [] })),
      API.get("/admin/memberships").catch(() => ({ data: [] })),
      API.get("/events/admin/all").catch(() => ({ data: [] })),
      API.get("/bookings/admin/all").catch(() => ({ data: [] })),
    ]).then(([u, v, o, m, ev, bk]) => {
      const users = Array.isArray(u.data) ? u.data : u.data?.users || [];
      const vendors = Array.isArray(v.data) ? v.data : v.data?.vendors || [];
      const orders = Array.isArray(o.data) ? o.data : o.data?.orders || [];
      const memberships = Array.isArray(m.data) ? m.data : m.data?.memberships || [];
      const events = Array.isArray(ev.data) ? ev.data : [];
      const bookings = Array.isArray(bk.data) ? bk.data : [];

      const totalRevenue = bookings
        .filter(b => b.status === "confirmed")
        .reduce((s, b) => s + (b.totalPrice || 0), 0);

      // Category breakdown
      const catMap = {};
      events.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
      const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

      setStats({
        users: users.length,
        vendors: vendors.length,
        orders: orders.length,
        memberships: memberships.length,
        events: events.length,
        bookings: bookings.length,
        upcomingEvents: events.filter(e => e.status === "upcoming").length,
        totalRevenue,
      });
      setRecentBookings(bookings.slice(0, 5));
      setEventsByCategory(catData);
    });
  }, []);

  const statCards = [
    { label: "Total Users",    value: stats.users,         icon: Users,       color: "#6366f1", bg: "#eef2ff", path: "/admin/users" },
    { label: "Total Vendors",  value: stats.vendors,       icon: Store,       color: "#0ea5e9", bg: "#e0f2fe", path: "/admin/vendors" },
    { label: "Total Events",   value: stats.events,        icon: CalendarDays,color: "#8b5cf6", bg: "#f5f3ff", path: "/admin/events" },
    { label: "Upcoming Events",value: stats.upcomingEvents,icon: CalendarDays,color: "#10b981", bg: "#d1fae5", path: "/admin/events" },
    { label: "Total Bookings", value: stats.bookings,      icon: Ticket,      color: "#ec4899", bg: "#fce7f3", path: "/admin/bookings" },
    { label: "Total Orders",   value: stats.orders,        icon: ShoppingBag, color: "#f59e0b", bg: "#fef3c7", path: "/admin/orders" },
    { label: "Memberships",    value: stats.memberships,   icon: CreditCard,  color: "#ef4444", bg: "#fee2e2", path: "/admin/membership" },
    { label: "Revenue",        value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: "#10b981", bg: "#d1fae5", path: "/admin/bookings" },
  ];

  const statusStyle = {
    confirmed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
  };

  return (
    <DashboardLayout role="admin" userName={userName}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)" }}>
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 pointer-events-none">
          <div className="w-72 h-72 rounded-full border-4 border-white absolute -top-20 -right-20" />
          <div className="w-48 h-48 rounded-full border-4 border-white absolute top-10 right-10" />
        </div>
        <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
        <h2 className="text-3xl font-bold">{userName} 👋</h2>
        <p className="text-indigo-200 text-sm mt-2">Maintenance Menu — Admin access only.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-indigo-300" />
            <span className="text-indigo-200 text-xs">All systems operational</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-indigo-300" />
            <span className="text-indigo-200 text-xs">{stats.upcomingEvents} upcoming events</span>
          </div>
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
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue & Bookings</h3>
              <p className="text-slate-400 text-xs mt-0.5">Monthly performance overview</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-3 py-1.5 rounded-full">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRev)" dot={{ fill: "#6366f1", r: 3 }} />
              <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" strokeWidth={2.5} fill="url(#colorBk)" dot={{ fill: "#10b981", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Category Pie */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-1">Events by Category</h3>
          <p className="text-slate-400 text-xs mb-4">Distribution across categories</p>
          {eventsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={eventsByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  paddingAngle={3} dataKey="value">
                  {eventsByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-300 text-sm">No events yet</div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">Recent Bookings</h3>
          </div>
          <button onClick={() => navigate("/admin/bookings")}
            className="text-indigo-600 text-xs font-semibold hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No bookings yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentBookings.map(b => (
              <div key={b._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                    {(b.userId?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{b.userId?.name || "User"}</p>
                    <p className="text-slate-400 text-xs">{b.eventId?.title || "Event"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 text-sm">₹{b.totalPrice}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
