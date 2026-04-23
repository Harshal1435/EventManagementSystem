import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageVendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [activeSection, setActiveSection] = useState("vendorUpdate");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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
      console.error(error);
      toast.error("Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Fill all fields");
      return;
    }

    try {
      await API.post("/admin/vendors", {
        ...form,
        role: "vendor",
      });

      toast.success("Vendor added");
      setForm({ name: "", email: "", password: "" });

      await fetchVendors();
      setActiveSection("vendorUpdate");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Failed to add vendor");
    }
  };

  const handleDeleteVendor = async (id) => {
    const ok = window.confirm("Delete this vendor?");
    if (!ok) return;

    try {
      await API.delete(`/admin/vendors/${id}`);
      toast.success("Vendor deleted");

      await fetchVendors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete vendor");
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

  const buttonClass =
    "bg-[#f7f7f7] border-2 border-lime-500 rounded-xl text-black hover:bg-white transition";
  const smallBtn = `${buttonClass} w-[135px] h-[42px] text-[17px]`;
  const leftBtn = `${buttonClass} h-[42px] text-[17px] px-4`;

  return (
    <div className="min-h-screen bg-[#d9d9d9] p-2 md:p-4">
      <div className="w-full max-w-[720px] min-h-[310px] mx-auto bg-[#cfcfcf] border border-gray-400 relative px-4 py-4 md:px-6">

        {/* Top Buttons */}
        <button
          onClick={() => navigate("/admin")}
          className={`absolute top-4 left-4 md:left-8 w-[135px] h-[44px] text-[18px] ${buttonClass}`}
        >
          Home
        </button>

        <button
          onClick={handleLogout}
          className={`absolute top-4 right-4 md:right-8 w-[135px] h-[44px] text-[18px] ${buttonClass}`}
        >
          LogOut
        </button>

        {/* Wireframe Layout */}
        <div className="pt-20">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">

            {/* Left Side */}
            <div className="flex flex-col gap-14">
              <button
                onClick={() => setActiveSection("vendorUpdate")}
                className={`${leftBtn} w-[180px]`}
              >
                Vendor Management
              </button>
            </div>

            {/* Right Side */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveSection("vendorAdd")}
                className={smallBtn}
              >
                Add
              </button>

              <button
                onClick={async () => {
                  setActiveSection("vendorUpdate");
                  await fetchVendors();
                }}
                className={smallBtn}
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">

          {/* ADD VENDOR */}
          {activeSection === "vendorAdd" && (
            <div className="bg-white rounded-xl shadow p-5 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Add Vendor
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="border p-3 rounded"
                />

                <input
                  type="email"
                  placeholder="Vendor Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="border p-3 rounded"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="border p-3 rounded"
                />
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={handleAddVendor}
                  className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
                >
                  Add Vendor
                </button>
              </div>
            </div>
          )}

          {/* UPDATE / LIST */}
          {activeSection === "vendorUpdate" && (
            <div className="bg-white rounded-xl shadow p-5 mt-4 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Vendor List
              </h2>

              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : vendors.length === 0 ? (
                <p className="text-center text-gray-500">
                  No vendors found
                </p>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Name</th>
                      <th className="border p-3 text-left">Email</th>
                      <th className="border p-3 text-left">Role</th>
                      <th className="border p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((item) => (
                      <tr key={item._id}>
                        <td className="border p-3">{item.name}</td>
                        <td className="border p-3">{item.email}</td>
                        <td className="border p-3">{item.role}</td>
                        <td className="border p-3">
                          <button
                            onClick={() => handleDeleteVendor(item._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}