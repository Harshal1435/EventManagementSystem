import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Users, Clock, ArrowLeft, Ticket, User, Phone, FileText } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const catEmoji = { wedding: "💍", concert: "🎵", conference: "🏢", birthday: "🎂", corporate: "💼", other: "🎉" };
const catColors = {
  wedding: { bg: "#fce7f3", color: "#db2777" },
  concert: { bg: "#ede9fe", color: "#7c3aed" },
  conference: { bg: "#dbeafe", color: "#2563eb" },
  birthday: { bg: "#fef3c7", color: "#d97706" },
  corporate: { bg: "#d1fae5", color: "#059669" },
  other: { bg: "#f1f5f9", color: "#64748b" },
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ seats: 1, guestName: "", guestPhone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      setEvent(res.data);
    } catch { toast.error("Failed to load event"); navigate("/user/events"); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!booking.seats || booking.seats < 1) return toast.error("Select at least 1 seat");
    try {
      setSubmitting(true);
      await API.post("/bookings", { eventId: id, ...booking });
      toast.success("Booking confirmed! 🎉");
      navigate("/user/bookings");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Booking failed");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <DashboardLayout role="user" userName={userName}>
      <div className="text-center py-20 text-slate-400">Loading event...</div>
    </DashboardLayout>
  );

  if (!event) return null;

  const cc = catColors[event.category] || catColors.other;
  const available = event.capacity - (event.bookedCount || 0);
  const totalPrice = event.price * booking.seats;

  return (
    <DashboardLayout role="user" userName={userName}>
      <button onClick={() => navigate("/user/events")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Banner */}
          <div className="card overflow-hidden">
            <div className="h-56 relative flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${cc.color}22, ${cc.color}55)` }}>
              {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <span className="text-8xl opacity-40">{catEmoji[event.category] || "🎉"}</span>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold capitalize"
                  style={{ background: cc.bg, color: cc.color }}>
                  {event.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
                  event.status === "upcoming" ? "bg-emerald-100 text-emerald-700"
                  : event.status === "cancelled" ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
                }`}>{event.status}</span>
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>
              {event.description && <p className="text-slate-500 mt-2 leading-relaxed">{event.description}</p>}

              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                {[
                  { icon: CalendarDays, label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                  { icon: Clock, label: "Time", value: event.time },
                  { icon: MapPin, label: "Location", value: event.location },
                  { icon: Users, label: "Capacity", value: `${event.bookedCount || 0} / ${event.capacity} booked` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {event.venue && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-indigo-400 font-medium">Venue</p>
                  <p className="text-sm font-semibold text-indigo-700 mt-0.5">{event.venue}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400">Organized by</p>
                  <p className="font-semibold text-slate-700">{event.vendorId?.name || "Organizer"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Price per seat</p>
                  <p className="text-2xl font-bold text-indigo-600">{event.price > 0 ? `₹${event.price}` : "Free"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Ticket size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800">Book Tickets</h3>
            </div>

            {available <= 0 ? (
              <div className="text-center py-6">
                <p className="text-red-500 font-semibold">Sold Out</p>
                <p className="text-slate-400 text-sm mt-1">No seats available</p>
              </div>
            ) : event.status === "cancelled" ? (
              <div className="text-center py-6">
                <p className="text-red-500 font-semibold">Event Cancelled</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Number of Seats <span className="text-slate-400 normal-case font-normal">({available} available)</span>
                  </label>
                  <input type="number" min="1" max={available} value={booking.seats}
                    onChange={e => setBooking({ ...booking, seats: Math.min(Number(e.target.value), available) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <User size={11} className="inline mr-1" />Guest Name
                  </label>
                  <input type="text" placeholder="Your name" value={booking.guestName}
                    onChange={e => setBooking({ ...booking, guestName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <Phone size={11} className="inline mr-1" />Phone
                  </label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" value={booking.guestPhone}
                    onChange={e => setBooking({ ...booking, guestPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <FileText size={11} className="inline mr-1" />Notes (optional)
                  </label>
                  <textarea placeholder="Any special requirements..." value={booking.notes}
                    onChange={e => setBooking({ ...booking, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 resize-none" />
                </div>

                {/* Price Summary */}
                <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{booking.seats} seat{booking.seats > 1 ? "s" : ""} × ₹{event.price}</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="border-t border-indigo-100 pt-2 flex justify-between font-bold text-slate-800">
                    <span>Total</span>
                    <span className="text-indigo-600 text-lg">{event.price > 0 ? `₹${totalPrice}` : "Free"}</span>
                  </div>
                </div>

                <button onClick={handleBook} disabled={submitting}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  <Ticket size={15} />
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
