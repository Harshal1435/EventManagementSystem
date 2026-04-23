import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function MembershipPage() {
  const navigate = useNavigate();

  const [memberships, setMemberships] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const [form, setForm] = useState({
    vendorId: "",
    type: "6months",
    startDate: "",
    endDate: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMemberships();
    fetchVendors();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoadingMemberships(true);

      const res = await API.get("/memberships");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.memberships)
        ? res.data.memberships
        : [];

      setMemberships(data);
    } catch (error) {
      console.error(
        "Fetch memberships error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to load memberships");
      setMemberships([]);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);

      const res = await API.get("/admin/vendors");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.vendors)
        ? res.data.vendors
        : [];

      setVendors(data);
    } catch (error) {
      console.error(
        "Fetch vendors error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to load vendors");
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const resetForm = () => {
    setForm({
      vendorId: "",
      type: "6months",
      startDate: "",
      endDate: "",
    });
    setEditId(null);
  };

  const handleSubmitMembership = async () => {
    if (!form.vendorId || !form.type || !form.startDate || !form.endDate) {
      toast.error("Please fill all membership fields");
      return;
    }

    const payload = {
      vendorId: form.vendorId,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      if (editId) {
        await API.put(`/memberships/${editId}`, payload);
        toast.success("Membership updated successfully");
      } else {
        await API.post("/memberships", payload);
        toast.success("Membership added successfully");
      }

      resetForm();
      await fetchMemberships();
    } catch (error) {
      console.error(
        "Membership submit error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to save membership");
    }
  };

  const handleEditMembership = (item) => {
    setEditId(item._id);

    setForm({
      vendorId: item.vendorId?._id || item.vendorId || "",
      type: item.type || "6months",
      startDate: item.startDate ? item.startDate.split("T")[0] : "",
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
    });
  };

  const handleDeleteMembership = async (id) => {
    const ok = window.confirm("Delete this membership?");
    if (!ok) return;

    try {
      await API.delete(`/memberships/${id}`);
      toast.success("Membership deleted successfully");
      await fetchMemberships();
    } catch (error) {
      console.error(
        "Delete membership error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to delete membership");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const getVendorName = (item) =>
    item.vendorId?.name || item.vendor?.name || item.vendorName || "-";

  const getVendorEmail = (item) =>
    item.vendorId?.email || item.vendor?.email || item.vendorEmail || "-";

  const buttonClass =
    "bg-[#f7f7f7] border-2 border-lime-500 rounded-xl text-black hover:bg-white transition";
  const smallButtonClass = `${buttonClass} w-[135px] h-[42px] text-[17px]`;
  const leftButtonClass = `${buttonClass} h-[42px] text-[17px] px-4`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f79c7] to-[#2c3e50] p-2 md:p-4">
      <div className="w-full max-w-[1000px] min-h-[500px] mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl relative px-4 py-4 md:px-6">
        {/* Top Buttons */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className={`absolute top-4 left-4 md:left-8 w-[135px] h-[44px] text-[18px] bg-white/90 border border-lime-400 rounded-xl text-black hover:bg-white transition`}
        >
          Home
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className={`absolute top-4 right-4 md:right-8 w-[135px] h-[44px] text-[18px] bg-white/90 border border-red-400 rounded-xl text-black hover:bg-red-50 transition`}
        >
          LogOut
        </button>

        {/* Header Buttons */}
        <div className="pt-20">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="flex flex-col gap-14">
              <button
                type="button"
                onClick={() => navigate("/admin/membership")}
                className={`${leftButtonClass} w-[150px] bg-white/90 border border-lime-400`}
              >
                Membership
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  fetchVendors();
                }}
                className={`${smallButtonClass} bg-white/90 border border-lime-400`}
              >
                Add
              </button>

              <button
                type="button"
                onClick={fetchMemberships}
                className={`${smallButtonClass} bg-white/90 border border-lime-400`}
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
            {editId ? "Update Membership" : "Add Membership"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Select Vendor</label>
              <select
                value={form.vendorId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    vendorId: e.target.value,
                  }))
                }
                className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">
                  {loadingVendors ? "Loading vendors..." : "Select Vendor"}
                </option>

                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Membership Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
              </select>
            </div>

            <div></div>

            <div>
              <label className="block mb-2 font-medium">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSubmitMembership}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              {editId ? "Update Membership" : "Add Membership"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-5 overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
            Membership List
          </h2>

          {loadingMemberships ? (
            <p className="text-center text-gray-500">Loading memberships...</p>
          ) : memberships.length === 0 ? (
            <p className="text-center text-gray-500">No memberships found</p>
          ) : (
            <table className="w-full border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Vendor Name</th>
                  <th className="border p-3 text-left">Vendor Email</th>
                  <th className="border p-3 text-left">Type</th>
                  <th className="border p-3 text-left">Start Date</th>
                  <th className="border p-3 text-left">End Date</th>
                  <th className="border p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="border p-3">{getVendorName(item)}</td>
                    <td className="border p-3">{getVendorEmail(item)}</td>
                    <td className="border p-3">{item.type || "-"}</td>
                    <td className="border p-3">
                      {item.startDate
                        ? new Date(item.startDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border p-3">
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border p-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleEditMembership(item)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMembership(item._id)}
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
          )}
        </div>
      </div>
    </div>
  );
}