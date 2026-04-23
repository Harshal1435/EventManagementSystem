import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageVendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("list");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/vendors");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.vendors)
        ? res.data.vendors
        : [];

      setVendors(data);
    } catch (error) {
      console.error("Fetch vendors error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!form.name || !form.email || !form.password || !form.category) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await API.post("/admin/vendors", {
        ...form,
        role: "vendor",
      });

      toast.success("Vendor added successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        category: "",
      });

      setActiveSection("list");
      await fetchVendors();
    } catch (error) {
      console.error("Add vendor error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to add vendor");
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Delete vendor?")) return;

    try {
      await API.delete(`/admin/vendors/${id}`);
      toast.success("Vendor deleted");
      await fetchVendors();
    } catch (error) {
      console.error("Delete vendor error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to delete vendor");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f79c7] via-[#5d86d2] to-[#2c3e50] p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 md:px-8 py-5 border-b bg-white/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Manage Vendors
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Add vendors, manage vendor accounts, and assign memberships
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="px-5 py-2.5 rounded-xl border-2 border-lime-500 bg-white text-gray-800 font-medium hover:bg-lime-50 transition"
            >
              Home
            </button>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl border-2 border-red-400 bg-white text-gray-800 font-medium hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Section Buttons */}
        <div className="px-5 md:px-8 py-5 border-b bg-slate-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection("add")}
              className={`px-5 py-2.5 rounded-xl font-medium transition ${
                activeSection === "add"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              Add Vendor
            </button>

            <button
              onClick={async () => {
                setActiveSection("list");
                await fetchVendors();
              }}
              className={`px-5 py-2.5 rounded-xl font-medium transition ${
                activeSection === "list"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              Vendor List
            </button>
          </div>
        </div>

        {/* Add Vendor Form */}
        {activeSection === "add" && (
          <div className="p-5 md:p-8">
            <div className="bg-white rounded-2xl border shadow-sm p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 text-center">
                Add New Vendor
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="email"
                  placeholder="Vendor Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="text"
                  placeholder="Category (e.g. Food, Electronics)"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleAddVendor}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl shadow hover:bg-green-700 transition"
                >
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendor List */}
        {activeSection === "list" && (
          <div className="p-5 md:p-8">
            <div className="bg-white rounded-2xl border shadow-sm p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 text-center">
                Vendor List
              </h2>

              {loading ? (
                <p className="text-center text-gray-500">Loading vendors...</p>
              ) : vendors.length === 0 ? (
                <p className="text-center text-gray-500">No vendors found</p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="p-3 border">Name</th>
                          <th className="p-3 border">Email</th>
                          <th className="p-3 border">Category</th>
                          <th className="p-3 border">Role</th>
                          <th className="p-3 border">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {vendors.map((v) => (
                          <tr
                            key={v._id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="p-3 border">{v.name}</td>
                            <td className="p-3 border">{v.email}</td>
                            <td className="p-3 border">{v.category || "-"}</td>
                            <td className="p-3 border capitalize">
                              {v.role || "vendor"}
                            </td>
                            <td className="p-3 border">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() =>
                                    navigate(`/admin/membership?vendorId=${v._id}`)
                                  }
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                >
                                  Membership
                                </button>

                                <button
                                  onClick={() => deleteVendor(v._id)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="grid gap-4 md:hidden">
                    {vendors.map((v) => (
                      <div
                        key={v._id}
                        className="border rounded-2xl p-4 shadow-sm bg-gray-50"
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {v.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{v.email}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Category:</span>{" "}
                          {v.category || "-"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          <span className="font-medium">Role:</span>{" "}
                          {v.role || "vendor"}
                        </p>

                        <div className="flex gap-2 mt-4 flex-wrap">
                          <button
                            onClick={() =>
                              navigate(`/admin/membership?vendorId=${v._id}`)
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          >
                            Membership
                          </button>

                          <button
                            onClick={() => deleteVendor(v._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}