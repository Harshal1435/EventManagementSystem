import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CalendarDays, Users, Ticket, Star } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: CalendarDays, title: "Event Management", desc: "Create & manage events of any scale" },
  { icon: Ticket, title: "Easy Booking", desc: "Seamless ticket booking experience" },
  { icon: Users, title: "Guest Lists", desc: "Track attendees & manage guests" },
  { icon: Star, title: "Vendor Network", desc: "Connect with top-tier vendors" },
];

const DEMO_ACCOUNTS = [
  { role: "Admin",  email: "admin@ems.com",       color: "#6366f1", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)"  },
  { role: "Vendor", email: "priya@vendor.com",     color: "#0ea5e9", bg: "rgba(14,165,233,0.15)",  border: "rgba(14,165,233,0.3)"  },
  { role: "User",   email: "arjun@user.com",       color: "#10b981", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)"  },
];

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const login = async () => {
    if (!data.email || !data.password) return toast.error("Please fill all fields");
    try {
      setLoading(true);
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      const role = JSON.parse(atob(res.data.token.split(".")[1])).role;
      toast.success(`Welcome back! Redirecting...`);
      setTimeout(() => {
        if (role === "admin") window.location.href = "/admin";
        else if (role === "vendor") window.location.href = "/vendor";
        else window.location.href = "/user";
      }, 600);
    } catch (err) {
      toast.error(err?.response?.data?.msg || err?.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#0a0f1e" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden p-12">

        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-auto">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <CalendarDays size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">EventMS</p>
            <p className="text-slate-500 text-xs mt-0.5">Event Management System</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium">Platform v2.0 — Now with Events</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] mb-5">
            Your Complete<br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Event & Vendor
            </span><br />
            Platform
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
            Manage events, book tickets, handle vendors and memberships — everything in one powerful dashboard.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.2)" }}>
                  <Icon size={15} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[["500+", "Events Created"], ["10K+", "Tickets Booked"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-white font-black text-2xl">{val}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative mt-auto rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">
            "EventMS transformed how we manage our annual conference. Booking, vendors, guests — all in one place."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>R</div>
            <div>
              <p className="text-white text-xs font-semibold">Rahul Sharma</p>
              <p className="text-slate-500 text-xs">Event Director, TechConf India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative">
        {/* Subtle right bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(139,92,246,0.05) 100%)" }} />

        <div className="w-full max-w-[420px] relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <CalendarDays size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">EventMS</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8"
            style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" }}>

            {/* Header */}
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #eef2ff, #f5f3ff)" }}>
                <Lock size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Sign in</h2>
              <p className="text-slate-500 text-sm mt-1">Welcome back! Enter your credentials to continue.</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && login()}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={data.password}
                    onChange={e => setData({ ...data, password: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && login()}
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={login}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
                style={{ background: loading ? "#818cf8" : "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <> Sign In <ArrowRight size={16} /> </>
                )}
              </button>
            </div>

      

            {/* Sign up link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Create one free →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
