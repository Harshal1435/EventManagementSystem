import { useState } from "react";
import API from "../../api/axios";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);

      const role = JSON.parse(atob(res.data.token.split(".")[1])).role;

      if (role === "admin") window.location.href = "/admin";
      else if (role === "vendor") window.location.href = "/vendor";
      else window.location.href = "/user";
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6">
          Login to continue your journey
        </p>

        {/* Email */}
        <input
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Email"
          type="email"
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        {/* Password */}
        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Password"
          type="password"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        {/* Login Button */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Signup Button */}
        <button
          onClick={() => (window.location.href = "/signup")}
          className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}