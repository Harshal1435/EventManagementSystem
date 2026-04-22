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
    role: "user"
  });

  const [loading, setLoading] = useState(false);

  const signup = async () => {
    try {
      setLoading(true);

      await API.post("/auth/signup", data);

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Create Account</h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          className="border w-full p-2 mb-2 rounded"
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 mb-2 rounded"
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 mb-2 rounded"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        {/* ROLE */}
        <select
          className="border w-full p-2 mb-3 rounded"
          onChange={(e) => setData({ ...data, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>

        {/* BUTTON */}
        <button
          onClick={signup}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}