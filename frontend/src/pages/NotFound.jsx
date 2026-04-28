import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">VendorMS</span>
        </div>
        <p className="text-8xl font-black text-white mb-4" style={{ opacity: 0.15 }}>404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")}
          className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold">
          Back to Login
        </button>
      </div>
    </div>
  );
}
