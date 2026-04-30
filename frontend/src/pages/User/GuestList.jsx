import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck, Plus, Trash2, Phone, Mail, Search,
  CalendarDays, ArrowRight,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["invited", "confirmed", "attended", "cancelled"];

const statusStyle = {
  invited:   { bg: "bg-blue-50",    text: "text-blue-700"    },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700" },
  attended:  { bg: "bg-indigo-50",  text: "text-indigo-700"  },
  cancelled: { bg: "bg-red-50",     text: "text-red-700"     },
};

export default function UserGuestList() {
  const navigate = useNavigate();
  const [guests, setGuests]         = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [userName, setUserName]     = useState("User");
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ eventId: "", name: "", email: "", phone: "", notes: "" });

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});

    // Load user's bookings to populate the event dropdown
    API.get("/bookings/my").then(r => {
      const bookings = r.data || [];
      // Keep pending + confirmed, deduplicate by event _id
      const seen = new Set();
      const events = [];
      bookings.forEach(b => {
        if (
          (b.status === "confirmed" || b.status === "pending") &&
          b.eventId &&
          typeof b.eventId === "object" &&
          !seen.has(b.eventId._id)
        ) {
          seen.add(b.eventId._id);
          events.push(b.eventId);
        }
      });
      setBookedEvents(events);
    }).catch(() => {});

    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/guests/my");
      setGuests(res.data || []);
    } catch { toast.error("Failed to load guest list"); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error("Guest name is required");
    if (!form.eventId)     return toast.error("Please select an event");
    try {
      await API.post("/guests", { ...form });
      toast.success("Guest added!");
      setForm({ eventId: "", name: "", email: "", phone: "", notes: "" });
      setShowForm(false);
      fetchGuests();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to add guest");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/guests/${id}/status`, { status });
      fetchGuests();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this guest?")) return;
    try {
      await API.delete(`/guests/${id}`);
      toast.success("Guest removed");
      fetchGuests();
    } catch { toast.error("Failed to remove guest"); }
  };

  const filtered = guests.filter(g => {
    const matchSearch =
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone || "").includes(search);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total",     value: guests.length,                                       color: "#6366f1" },
    { label: "Invited",   value: guests.filter(g => g.status === "invited").length,   color: "#3b82f6" },
    { label: "Confirmed", value: guests.filter(g => g.status === "confirmed").length, color: "#10b981" },
    { label: "Attended",  value: guests.filter(g => g.status === "attended").length,  color: "#8b5cf6" },
    { label: "Cancelled", value: guests.filter(g => g.status === "cancelled").length, color: "#ef4444" },
  ];

  return (
    <DashboardLayout role="user" userName={userName}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Guest List</h2>
          <p className="text-slate-500 text-sm">{guests.length} guests across your bookings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <Plus size={16} /> {showForm ? "Cancel" : "Add Guest"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="stat-card !p-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Guest Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-5">Add New Guest</h3>

          {bookedEvents.length === 0 ? (
            <div className="text-center py-6">
              <UserCheck size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">
                You need a booking to add guests. Book an event first.
              </p>
              <button onClick={() => navigate("/user/events")}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
                Browse Events <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Event selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Select Event *
                  </label>
                  <select value={form.eventId}
                    onChange={e => setForm({ ...form, eventId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
                    <option value="">Choose your booked event...</option>
                    {bookedEvents.map(ev => (
                      <option key={ev._id} value={ev._id}>
                        {ev.title} — {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  { key: "name",  placeholder: "Guest Name *",    type: "text"  },
                  { key: "email", placeholder: "Email Address",   type: "email" },
                  { key: "phone", placeholder: "Phone Number",    type: "tel"   },
                  { key: "notes", placeholder: "Notes (optional)",type: "text"  },
                ].map(({ key, placeholder, type }) => (
                  <div key={key}>
                    <input type={type} placeholder={placeholder} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={handleAdd}
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
                  Add Guest
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by name, email or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none min-w-[140px]">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Guest Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <UserCheck size={16} className="text-indigo-500" />
          <h3 className="font-bold text-slate-800">Guests</h3>
          <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading guests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No guests found</p>
            <p className="text-slate-400 text-sm mt-1">
              {guests.length === 0
                ? "Add guests to your booked events using the button above"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-50">
              {filtered.map(g => {
                const ss = statusStyle[g.status] || statusStyle.invited;
                return (
                  <div key={g._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          {g.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{g.name}</p>
                          {g.notes && <p className="text-xs text-slate-400">{g.notes}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(g._id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {g.email && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={11} className="text-slate-400" />{g.email}</p>}
                      {g.phone && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone size={11} className="text-slate-400" />{g.phone}</p>}
                    </div>
                    {g.eventId?.title && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <CalendarDays size={11} className="text-indigo-400" />{g.eventId.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select value={g.status}
                        onChange={e => handleStatusUpdate(g._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none ${ss.bg} ${ss.text}`}>
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} className="bg-white text-slate-800 capitalize">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Guest", "Contact", "Event", "Update Status", "Delete"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(g => {
                    const ss = statusStyle[g.status] || statusStyle.invited;
                    return (
                      <tr key={g._id} className="hover:bg-slate-50/70 transition">
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                              {g.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{g.name}</p>
                              {g.notes && <p className="text-xs text-slate-400 mt-0.5">{g.notes}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {g.email && (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Mail size={11} className="text-slate-400 shrink-0" />{g.email}
                              </p>
                            )}
                            {g.phone && (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Phone size={11} className="text-slate-400 shrink-0" />{g.phone}
                              </p>
                            )}
                            {!g.email && !g.phone && <span className="text-xs text-slate-300">—</span>}
                          </div>
                        </td>

                        {/* Event */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-medium text-slate-700 max-w-[140px] truncate">
                            {g.eventId?.title || "—"}
                          </p>
                          {g.eventId?.date && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(g.eventId.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          )}
                        </td>

                        {/* Update Status */}
                        <td className="px-5 py-4">
                          <select value={g.status}
                            onChange={e => handleStatusUpdate(g._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none ${ss.bg} ${ss.text}`}>
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="bg-white text-slate-800 capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete */}
                        <td className="px-5 py-4">
                          <button onClick={() => handleDelete(g._id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
