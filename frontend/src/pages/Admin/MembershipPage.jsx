import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function MembershipPage() {
  const [params] = useSearchParams();
  const vendorIdFromURL = params.get("vendorId");

  const [vendors, setVendors] = useState([]);
  const [memberships, setMemberships] = useState([]);

  const [form, setForm] = useState({
    vendorId: vendorIdFromURL || "",
    type: "6months",
    startDate: "",
    endDate: "",
  });

  const calculateEndDate = (start, type) => {
    if (!start) return "";
    const d = new Date(start);
    if (type === "6months") d.setMonth(d.getMonth() + 6);
    if (type === "1year") d.setFullYear(d.getFullYear() + 1);
    if (type === "2years") d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchVendors();
    fetchMemberships();
  }, []);

  const fetchVendors = async () => {
    const res = await API.get("/admin/vendors");
    setVendors(res.data);
  };

  const fetchMemberships = async () => {
    const res = await API.get("/admin/memberships");
    setMemberships(res.data);
  };

  const submit = async () => {
    if (!form.vendorId || !form.startDate) {
      toast.error("Fill all fields");
      return;
    }

    await API.post("/admin/memberships", form);
    toast.success("Membership Added");

    setForm({
      vendorId: "",
      type: "6months",
      startDate: "",
      endDate: "",
    });

    fetchMemberships();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f79c7] to-[#2c3e50] p-4">
      <div className="max-w-5xl mx-auto">

        {/* CARD */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8">

          {/* TITLE */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Add Membership
          </h2>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Vendor */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Select Vendor
              </label>
              <select
                value={form.vendorId}
                onChange={(e) =>
                  setForm({ ...form, vendorId: e.target.value })
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Membership Type
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value;
                  setForm({
                    ...form,
                    type,
                    endDate: calculateEndDate(form.startDate, type),
                  });
                }}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  const start = e.target.value;
                  setForm({
                    ...form,
                    startDate: start,
                    endDate: calculateEndDate(start, form.type),
                  });
                }}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* End Date */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                End Date (Auto)
              </label>
              <input
                type="date"
                value={form.endDate}
                readOnly
                className="w-full border p-3 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-6 text-center">
            <button
              onClick={submit}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow hover:bg-blue-700 transition"
            >
              Save Membership
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-4">
            Membership List
          </h2>

          {memberships.length === 0 ? (
            <p className="text-center text-gray-500">
              No memberships found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Start</th>
                    <th className="p-3">End</th>
                  </tr>
                </thead>

                <tbody>
                  {memberships.map((m) => (
                    <tr
                      key={m._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3">
                        {m.vendorId?.name || "N/A"}
                      </td>
                      <td className="p-3">{m.type}</td>
                      <td className="p-3">
                        {new Date(m.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {new Date(m.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}