import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    category: "",
  });

  const [loading, setLoading] = useState(false);

  const signup = async () => {
    try {
      if (!data.name || !data.email || !data.password || !data.role) {
        return toast.error("Please fill all required fields");
      }

      if (data.role === "vendor" && !data.category) {
        return toast.error("Please select vendor category");
      }

      setLoading(true);

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        category: data.role === "vendor" ? data.category : null,
      };

      await API.post("/auth/signup", payload);

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Your Account 🚀
        </h2>
        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Join us and get started
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={data.name}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={data.email}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <select
          value={data.role}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) =>
            setData({
              ...data,
              role: e.target.value,
              category: e.target.value === "vendor" ? data.category : "",
            })
          }
        >
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>

        {data.role === "vendor" && (
          <select
            value={data.category}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setData({ ...data, category: e.target.value })}
          >
            <option value="">Select Vendor Category</option>
            <option value="grocery">Grocery</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="food">Food</option>
            <option value="medicine">Medicine</option>
          </select>
        )}

        <button
          onClick={signup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}