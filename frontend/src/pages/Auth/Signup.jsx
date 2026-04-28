import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, ArrowRight, Eye, EyeOff,
  CalendarDays, ShieldCheck, Store, UserCircle, Tag, CheckCircle,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["grocery", "electronics", "fashion", "food", "medicine",
  "wedding", "concert", "conference", "birthday", "corporate", "other"];

const ROLES = [
  {
    value: "user",
    label: "User",
    icon: UserCircle,
    desc: "Browse events & shop from vendors",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    activeBg: "rgba(16,185,129,0.18)",
  },
  {
    value: "vendor",
    label: "Vendor",
    icon: Store,
    desc: "Create events & sell products",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.12)",
    border: "rgba(14,165,233,0.3)",
    activeBg: "rgba(14,165,233,0.18)",
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
    desc: "Full platform management",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.3)",
    activeBg: "rgba(99,102,241,0.18)",
  },
];

const PERKS = [
  "Create & manage events",
  "Book tickets instantly",
  "Vendor marketplace access",
  "Guest list management",
  "Real-time analytics",
  "Membership plans",
];

export default function Signup() {
  const navigate = useNavigate();
  const [data, setData] = useState({ name: "", email: "", password: "", role: "user", category: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1 = role select, 2 = details

  const signup = async () => {
    if (!data.name || !data.email || !data.password) return toast.error("Please fill all fields");
    if (data.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (data.role === "vendor" && !data.category) return toast.error("Please select a category");
    try {
      setLoading(true);
      await API.post("/auth/signup", { ...data, category: data.role === "vendor" ? data.category : null });
      toast.success("Account created successfully! 🎉");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed");
    } finally { setLoading(false); }
  };

  const selectedRole = ROLES.find(r => r.value === data.role);

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#0a0f1e" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden p-12">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
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

        {/* Content */}
        <div className="relative my-auto">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Join the<br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              EventMS
            </span><br />
            Community
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Create your free account and start managing events, booking tickets, and connecting with vendors today.
          </p>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.2)" }}>
                  <CheckCircle size={12} className="text-indigo-400" />
                </div>
                <span className="text-slate-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role preview */}
        <div className="relative mt-auto rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Choose your role</p>
          <div className="flex gap-2">
            {ROLES.map(r => (
              <div key={r.value} className="flex-1 text-center py-2 px-3 rounded-xl"
                style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <p className="text-xs font-bold" style={{ color: r.color }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(139,92,246,0.05) 100%)" }} />

        <div className="w-full max-w-[440px] relative py-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <CalendarDays size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">EventMS</span>
          </div>

          <div className="rounded-3xl p-8"
            style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" }}>

            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #eef2ff, #f5f3ff)" }}>
                <User size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Create account</h2>
              <p className="text-slate-500 text-sm mt-1">Free forever. No credit card required.</p>
            </div>

            {/* Step 1 — Role Selection */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                I want to join as
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon, desc, color, bg, border, activeBg }) => {
                  const isActive = data.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setData({ ...data, role: value, category: "" })}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                      style={{
                        background: isActive ? activeBg : "#f8fafc",
                        border: `2px solid ${isActive ? color : "#e2e8f0"}`,
                        boxShadow: isActive ? `0 4px 16px ${color}30` : "none",
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: isActive ? bg : "#f1f5f9" }}>
                        <Icon size={18} style={{ color: isActive ? color : "#94a3b8" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold" style={{ color: isActive ? color : "#475569" }}>{label}</p>
                        <p className="text-slate-400 text-[10px] leading-tight mt-0.5 hidden sm:block">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={data.password}
                    onChange={e => setData({ ...data, password: e.target.value })}
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
                {/* Password strength */}
                {data.password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{
                          background: data.password.length >= i * 3
                            ? i <= 1 ? "#ef4444" : i <= 2 ? "#f59e0b" : i <= 3 ? "#10b981" : "#6366f1"
                            : "#e2e8f0"
                        }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Category (vendor only) */}
              {data.role === "vendor" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Vendor Category
                  </label>
                  <div className="relative">
                    <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={data.category}
                      onChange={e => setData({ ...data, category: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 appearance-none transition-all"
                      style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                    >
                      <option value="">Select your category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={signup}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
                style={{
                  background: loading ? "#818cf8" : selectedRole
                    ? `linear-gradient(135deg, ${selectedRole.color}, #8b5cf6)`
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: loading ? "none" : `0 8px 24px ${selectedRole?.color || "#6366f1"}40`,
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <>Create {selectedRole?.label} Account <ArrowRight size={16} /></>
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="text-slate-400 text-xs text-center mt-4 leading-relaxed">
              By creating an account, you agree to our{" "}
              <span className="text-indigo-500 cursor-pointer hover:underline">Terms of Service</span>
              {" "}and{" "}
              <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            {/* Sign in link */}
            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Sign in →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
