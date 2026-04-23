import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function MembershipPage() {
  const navigate = useNavigate();

  const [memberships, setMemberships] = useState([]);
  const [vendorQuery, setVendorQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [searchingVendor, setSearchingVendor] = useState(false);
  const [loadingMemberships, setLoadingMemberships] = useState(false);

  const [form, setForm] = useState({
    vendorId: "",
    vendorName: "",
    vendorEmail: "",
    type: "6months",
    startDate: "",
    endDate: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    if (!vendorQuery.trim()) {
      setVendors([]);
      return;
    }

    const timer = setTimeout(() => {
      searchVendors();
    }, 400);

    return () => clearTimeout(timer);
  }, [vendorQuery]);

  const fetchMemberships = async () => {
    try {
      setLoadingMemberships(true);
      const res = await API.get("/admin/memberships");
      setMemberships(Array.isArray(res.data) ? res.data : []);
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

  const searchVendors = async () => {
    try {
      setSearchingVendor(true);

      const res = await API.get(
        `/admin/vendors/search?query=${encodeURIComponent(vendorQuery)}`
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setVendors(data);
    } catch (error) {
      console.error(
        "Search vendors error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to search vendors");
      setVendors([]);
    } finally {
      setSearchingVendor(false);
    }
  };

  const handleSelectVendor = (vendor) => {
    setForm((prev) => ({
      ...prev,
      vendorId: vendor._id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
    }));

    setVendorQuery(`${vendor.name} (${vendor.email})`);
    setVendors([]);
  };

  const resetForm = () => {
    setForm({
      vendorId: "",
      vendorName: "",
      vendorEmail: "",
      type: "6months",
      startDate: "",
      endDate: "",
    });
    setVendorQuery("");
    setVendors([]);
    setEditId(null);
  };

  const handleSubmitMembership = async () => {
    if (!form.vendorId || !form.type || !form.startDate || !form.endDate) {
      toast.error("Please fill all fields");
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
        await API.put(`/admin/memberships/${editId}`, payload);
        toast.success("Membership updated successfully");
      } else {
        await API.post("/admin/memberships", payload);
        toast.success("Membership added successfully");
      }

      resetForm();
      fetchMemberships();
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

    const vendorName = item.vendor?.name || "";
    const vendorEmail = item.vendor?.email || "";

    setForm({
      vendorId: item.vendorId || item.vendor?._id || "",
      vendorName,
      vendorEmail,
      type: item.type || "6months",
      startDate: item.startDate ? item.startDate.split("T")[0] : "",
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
    });

    setVendorQuery(
      vendorName || vendorEmail
        ? `${vendorName}${vendorEmail ? ` (${vendorEmail})` : ""}`
        : ""
    );
  };

  const handleDeleteMembership = async (id) => {
    const ok = window.confirm("Delete this membership?");
    if (!ok) return;

    try {
      await API.delete(`/admin/memberships/${id}`);
      toast.success("Membership deleted successfully");
      fetchMemberships();
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

  const buttonClass =
    "bg-[#f7f7f7] border-2 border-lime-500 rounded-xl text-black hover:bg-white transition";
  const smallButtonClass = `${buttonClass} w-[135px] h-[42px] text-[17px]`;
  const leftButtonClass = `${buttonClass} h-[42px] text-[17px] px-4`;

  return (
    <div className="min-h-screen bg-[#d9d9d9] p-2 md:p-4">
      <div className="w-full max-w-[900px] min-h-[450px] mx-auto bg-[#cfcfcf] border border-gray-400 relative px-4 py-4 md:px-6">
        {/* Top Buttons */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className={`absolute top-4 left-4 md:left-8 w-[135px] h-[44px] text-[18px] ${buttonClass}`}
        >
          Home
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className={`absolute top-4 right-4 md:right-8 w-[135px] h-[44px] text-[18px] ${buttonClass}`}
        >
          LogOut
        </button>

        {/* Wireframe Header Buttons */}
        <div className="pt-20">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="flex flex-col gap-14">
              <button
                type="button"
                onClick={() => navigate("/admin/membership")}
                className={`${leftButtonClass} w-[135px]`}
              >
                Membership
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={resetForm}
                className={smallButtonClass}
              >
                Add
              </button>

              <button
                type="button"
                onClick={fetchMemberships}
                className={smallButtonClass}
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {editId ? "Update Membership" : "Add Membership"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search vendor by name or email"
                value={vendorQuery}
                onChange={(e) => {
                  setVendorQuery(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    vendorId: "",
                    vendorName: "",
                    vendorEmail: "",
                  }));
                }}
                className="border p-3 rounded w-full"
              />

              {searchingVendor && (
                <p className="text-sm text-gray-500 mt-2">Searching vendors...</p>
              )}

              {!searchingVendor && vendors.length > 0 && (
                <div className="border rounded mt-2 max-h-48 overflow-y-auto bg-white">
                  {vendors.map((vendor) => (
                    <button
                      key={vendor._id}
                      type="button"
                      onClick={() => handleSelectVendor(vendor)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b"
                    >
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </button>
                  ))}
                </div>
              )}

              {form.vendorId && (
                <div className="mt-3 p-3 rounded bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    Selected Vendor
                  </p>
                  <p className="font-medium">{form.vendorName}</p>
                  <p className="text-sm text-gray-600">{form.vendorEmail}</p>
                </div>
              )}
            </div>

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border p-3 rounded"
            >
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="2years">2 Years</option>
            </select>

            <div></div>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="border p-3 rounded"
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="border p-3 rounded"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleSubmitMembership}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              {editId ? "Update Membership" : "Add Membership"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 bg-white rounded-xl shadow p-5 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Membership List
          </h2>

          {loadingMemberships ? (
            <p className="text-center text-gray-500">Loading memberships...</p>
          ) : memberships.length === 0 ? (
            <p className="text-center text-gray-500">No memberships found</p>
          ) : (
            <table className="w-full border">
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
                  <tr key={item._id}>
                    <td className="border p-3">{item.vendor?.name || "-"}</td>
                    <td className="border p-3">{item.vendor?.email || "-"}</td>
                    <td className="border p-3">{item.type}</td>
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditMembership(item)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMembership(item._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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