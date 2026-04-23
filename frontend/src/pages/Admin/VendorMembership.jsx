import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function VendorMembership() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState({
    vendorId: "",
    membershipId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const vendorRes = await API.get("/admin/vendors");
      const membershipRes = await API.get("/admin/memberships");

      setVendors(vendorRes.data.vendors || vendorRes.data || []);
      setMemberships(membershipRes.data.memberships || membershipRes.data || []);
    } catch (error) {
      toast.error("Failed to load vendor membership data");
    }
  };

  const handleAssignMembership = async () => {
    try {
      await API.post("/admin/membership", form);
      toast.success("Membership added for vendor");
      setForm({ vendorId: "", membershipId: "" });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to assign membership");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button
        onClick={() => navigate("/admin")}
        className="mb-5 bg-blue-600 text-white px-5 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add Membership for Vendor</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Vendor</label>
          <select
            value={form.vendorId}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
            className="w-full border p-3 rounded"
          >
            <option value="">Choose Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Membership</label>
          <select
            value={form.membershipId}
            onChange={(e) => setForm({ ...form, membershipId: e.target.value })}
            className="w-full border p-3 rounded"
          >
            <option value="">Choose Membership</option>
            {memberships.map((membership) => (
              <option key={membership._id} value={membership._id}>
                {membership.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAssignMembership}
          className="bg-green-600 text-white px-6 py-3 rounded"
        >
          Add Membership
        </button>
      </div>
    </div>
  );
}