import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, CalendarDays, MapPin, ArrowRight, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };

export default function UserBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my");
      setBookings(res.data || []);
    } catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? You will receive a refund.")) return;
    try {
      await API.patch(`/bookings/cancel/${id}`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed to cancel"); }
  };

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

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Bookings</h2>
          <p className="text-slate-500 text-sm">{bookings.length} bookings</p>
        </div>
        <button onClick={() => navigate("/user/events")}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          Browse Events <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <Ticket size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">No bookings yet</p>
          <p className="text-slate-400 text-sm mb-6">Book your first event to see it here</p>
          <button onClick={() => navigate("/user/events")}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            Browse Events <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const event = b.eventId || {};
            return (
              <div key={b._id} className="card p-5 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: "#eef2ff" }}>
                      {catEmoji[event.category] || "🎉"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{event.title || "Event"}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {event.date && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarDays size={12} className="text-indigo-400" />
                            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} className="text-indigo-400" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-slate-500">{b.seats} seat{b.seats > 1 ? "s" : ""}</span>
                        {b.guestName && <span className="text-xs text-slate-500">· {b.guestName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-indigo-600 font-bold text-lg">₹{b.totalPrice}</p>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                        {b.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${payStyle[b.paymentStatus] || payStyle.unpaid}`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                    {b.status === "confirmed" && (
                      <button onClick={() => handleCancel(b._id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition mt-1">
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Booking ID */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-mono">Booking ID: {b._id?.slice(-12)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
