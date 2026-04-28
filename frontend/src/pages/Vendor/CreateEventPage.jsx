import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays, MapPin, Users, Clock, Tag, FileText,
  DollarSign, ArrowLeft, Save, ImagePlus, Loader,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "wedding",    label: "💍 Wedding",     color: "#db2777" },
  { value: "concert",    label: "🎵 Concert",     color: "#7c3aed" },
  { value: "conference", label: "🏢 Conference",  color: "#2563eb" },
  { value: "birthday",   label: "🎂 Birthday",    color: "#d97706" },
  { value: "corporate",  label: "💼 Corporate",   color: "#059669" },
  { value: "other",      label: "🎉 Other",       color: "#64748b" },
];

const Field = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {Icon && <Icon size={11} />}{label}{required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileRef = useRef();

  const [userName, setUserName] = useState("Vendor");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "other",
    date: "", time: "", location: "", venue: "",
    capacity: "", price: "0", image: "",
  });

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "Vendor")).catch(() => {});
    if (isEdit) {
      API.get(`/events/${id}`).then(r => {
        const e = r.data;
        setForm({
          title: e.title || "", description: e.description || "",
          category: e.category || "other",
          date: e.date ? e.date.split("T")[0] : "",
          time: e.time || "", location: e.location || "",
          venue: e.venue || "", capacity: e.capacity || "",
          price: e.price ?? "0", image: e.image || "",
        });
      }).catch(() => toast.error("Failed to load event"));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Cloudinary image upload ───────────────────────────
  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await API.post("/upload/event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("image", res.data.url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Upload failed — check Cloudinary credentials in .env");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.date || !form.time || !form.location || !form.capacity) {
      return toast.error("Please fill all required fields");
    }
    if (Number(form.capacity) < 1) return toast.error("Capacity must be at least 1");

    try {
      setLoading(true);
      const payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) || 0 };
      if (isEdit) {
        await API.put(`/events/${id}`, payload);
        toast.success("Event updated!");
      } else {
        await API.post("/events", payload);
        toast.success("Event created! 🎉");
      }
      navigate("/vendor/events");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save event");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout role="vendor" userName={userName}>
      <button onClick={() => navigate("/vendor/events")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Event" : "Create New Event"}</h2>
          <p className="text-slate-500 text-sm">{isEdit ? "Update event details" : "Fill in the details to publish your event"}</p>
        </div>

        <div className="space-y-6">
          {/* ── Image Upload ── */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <ImagePlus size={15} className="text-indigo-500" /> Event Banner Image
            </h3>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImageUpload(e.target.files[0])} />

            {form.image ? (
              <div className="relative rounded-2xl overflow-hidden h-48 group">
                <img src={form.image} alt="Event" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button onClick={() => fileRef.current.click()}
                    className="bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-100 transition">
                    Change
                  </button>
                  <button onClick={() => set("image", "")}
                    className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => fileRef.current.click()} disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition group disabled:opacity-60">
                {uploading ? (
                  <><Loader size={24} className="text-indigo-400 animate-spin" /><p className="text-slate-400 text-sm">Uploading...</p></>
                ) : (
                  <><ImagePlus size={28} className="text-slate-300 group-hover:text-indigo-400 transition" />
                  <p className="text-slate-400 text-sm">Click to upload event banner</p>
                  <p className="text-slate-300 text-xs">JPG, PNG, WebP — max 5MB</p></>
                )}
              </button>
            )}
          </div>

          {/* ── Basic Info ── */}
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-slate-700 text-sm">Basic Information</h3>

            <Field label="Event Title" icon={FileText} required>
              <input type="text" placeholder="e.g. Annual Tech Conference 2025" value={form.title}
                onChange={e => set("title", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Description" icon={FileText}>
              <textarea placeholder="Describe your event — what to expect, who should attend..." value={form.description}
                onChange={e => set("description", e.target.value)} rows={3}
                className={`${inputCls} resize-none`} />
            </Field>

            {/* Category */}
            <Field label="Category" icon={Tag} required>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => set("category", cat.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition text-center ${
                      form.category === cat.value ? "text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    style={form.category === cat.value ? { background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` } : {}}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* ── Date, Time, Location ── */}
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-slate-700 text-sm">Date, Time & Location</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Date" icon={CalendarDays} required>
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Time" icon={Clock} required>
                <input type="time" value={form.time} onChange={e => set("time", e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City / Location" icon={MapPin} required>
                <input type="text" placeholder="e.g. Mumbai, Maharashtra" value={form.location}
                  onChange={e => set("location", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Venue Name" icon={MapPin}>
                <input type="text" placeholder="e.g. Taj Lands End Ballroom" value={form.venue}
                  onChange={e => set("venue", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>

          {/* ── Capacity & Price ── */}
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-slate-700 text-sm">Tickets & Pricing</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Total Capacity" icon={Users} required>
                <input type="number" min="1" placeholder="e.g. 200" value={form.capacity}
                  onChange={e => set("capacity", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Price per Seat (₹)" icon={DollarSign}>
                <input type="number" min="0" placeholder="0 for free event" value={form.price}
                  onChange={e => set("price", e.target.value)} className={inputCls} />
              </Field>
            </div>

            {/* Price preview */}
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <DollarSign size={14} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ticket price</p>
                <p className="font-bold text-indigo-700">
                  {Number(form.price) > 0 ? `₹${form.price} per seat` : "Free Event"}
                </p>
              </div>
              {form.capacity && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-500">Max revenue</p>
                  <p className="font-bold text-emerald-600">
                    ₹{(Number(form.price) * Number(form.capacity)).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading || uploading}
              className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
              {loading ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><Save size={15} />{isEdit ? "Update Event" : "Publish Event"}</>}
            </button>
            <button onClick={() => navigate("/vendor/events")}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
