import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserCheck, Plus, Trash2, ArrowLeft, Phone, Mail,
  CheckCircle, X, Clock, Search, CalendarDays, Filter,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["invited", "confirmed", "attended", "cancelled"];

const statusStyle = {
  invited:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400"    },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  attended:  { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400"  },
  cancelled: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400"     },
};

export default function GuestListPage() {
  const { eventId } = useParams();   // present when accessed from /vendor/events/:eventId/guests
  const navigate = useNavigate();

  const [guests, setGuests]     = useState([]);
  const [events, setEvents]     = useState([]);   // vendor's events for the dropdown
  const [event, setEvent]       = useState(null); // current event (if eventId in URL)
  const [loading, setLoading]   = useState(true);
  const [userName, setUserName] = useState("Vendor");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    eventId: eventId || "",
    name: "", email: "", phone: "", notes: "",
  });

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    // Load vendor's events for the "select event" dropdown in the add form
    API.get("/events/vendor/my").then(r => setEvents(r.data || [])).catch(() => {});

    if (eventId) {
      API.get(`/events/${eventId}`).then(r => setEvent(r.data)).catch(() => {});
      fetchGuests();
    } else {
      fetchAllGuests();
    }
  }, [eventId]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/guests/event/${eventId}`);
      setGuests(res.data || []);
    } catch { toast.error("Failed to load guests"); }
    finally { setLoading(false); }
  };

  const fetchAllGuests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/guests/my");
      setGuests(res.data || []);
    } catch { toast.error("Failed to load guests"); }
    finally { setLoading(false); }
  };

  const refresh = () => eventId ? fetchGuests() : fetchAllGuests();

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error("Guest name is required");
    const targetEventId = eventId || form.eventId;
    if (!targetEventId) return toast.error("Please select an event");
    try {
      await API.post("/guests", { eventId: targetEventId, ...form });
      toast.success("Guest added successfully");
      setForm({ eventId: eventId || "", name: "", email: "", phone: "", notes: "" });
      setShowForm(false);
      refresh();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed to add guest"); }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/guests/${id}/status`, { status });
      refresh();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this guest?")) return;
    try {
      await API.delete(`/guests/${id}`);
      toast.success("Guest removed");
      refresh();
    } catch { toast.error("Failed to remove guest"); }
  };

  // Filter
  const filtered = guests.filter(g => {
    const matchSearch =
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.phone?.includes(search);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     guests.length,
    invited:   guests.filter(g => g.status === "invited").length,
    confirmed: guests.filter(g => g.status === "confirmed").length,
    attended:  guests.filter(g => g.status === "attended").length,
    cancelled: guests.filter(g => g.status === "cancelled").length,
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {/* Back button when accessed from event detail */}
      {eventId && (
        <button onClick={() => navigate("/vendor/events")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition">
          <ArrowLeft size={16} /> Back to Events
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {event ? `Guest List — ${event.title}` : "All Guests"}
          </h2>
          {event && (
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays size={13} className="text-indigo-400" />
              <span className="text-slate-500 text-sm">
                {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}{event.location}
              </span>
            </div>
          )}
          {!event && <p className="text-slate-500 text-sm">{guests.length} total guests across all events</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <Plus size={16} /> {showForm ? "Cancel" : "Add Guest"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",     value: stats.total,     color: "#6366f1" },
          { label: "Invited",   value: stats.invited,   color: "#3b82f6" },
          { label: "Confirmed", value: stats.confirmed, color: "#10b981" },
          { label: "Attended",  value: stats.attended,  color: "#8b5cf6" },
          { label: "Cancelled", value: stats.cancelled, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card !p-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Guest Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Plus size={14} className="text-indigo-600" />
            </div>
            Add New Guest
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Event selector — only shown when not on a specific event page */}
            {!eventId && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Select Event *
                </label>
                <select value={form.eventId}
                  onChange={e => setForm({ ...form, eventId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 appearance-none">
                  <option value="">Choose an event...</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} — {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {[
              { key: "name",  placeholder: "Guest Name *",  type: "text"  },
              { key: "email", placeholder: "Email Address", type: "email" },
              { key: "phone", placeholder: "Phone Number",  type: "tel"   },
              { key: "notes", placeholder: "Notes (VIP, Speaker, etc.)", type: "text" },
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
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Guest Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">Guest List</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading guests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No guests found</p>
            <p className="text-slate-400 text-sm mt-1">
              {guests.length === 0 ? "Add your first guest using the button above" : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Guest", "Contact", !eventId && "Event", "Status", "Actions"].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(g => {
                  const ss = statusStyle[g.status] || statusStyle.invited;
                  return (
                    <tr key={g._id} className="hover:bg-slate-50/70 transition">
                      {/* Guest name */}
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

                      {/* Event (only on all-guests view) */}
                      {!eventId && (
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
                      )}

                      {/* Status dropdown */}
                      <td className="px-5 py-4">
                        <select value={g.status}
                          onChange={e => handleStatus(g._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none ${ss.bg} ${ss.text}`}>
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="bg-white text-slate-800 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
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
        )}
      </div>
    </DashboardLayout>
  );
}
