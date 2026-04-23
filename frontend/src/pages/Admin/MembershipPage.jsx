import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function MembershipPage() {
  const navigate = useNavigate();

  const [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState({
    vendorId: "",
    type: "6months",
    startDate: "",
    endDate: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await API.get("/admin/memberships");
      setMemberships(res.data || []);
    } catch (error) {
      console.error(
        "Fetch memberships error:",
        error.response?.data || error.message
      );
      toast.error("Failed to load memberships");
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
    if (!form.vendorId || !form.startDate || !form.endDate) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        await API.put(`/admin/memberships/${editId}`, form);
        toast.success("Membership updated");
      } else {
        await API.post("/admin/memberships", form);
        toast.success("Membership added");
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
    setForm({
      vendorId: item.vendorId || "",
      type: item.type || "6months",
      startDate: item.startDate ? item.startDate.split("T")[0] : "",
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
    });
  };

  const handleDeleteMembership = async (id) => {
    const ok = window.confirm("Delete this membership?");
    if (!ok) return;

    try {
      await API.delete(`/admin/memberships/${id}`);
      toast.success("Membership deleted");
      fetchMemberships();
    } catch (error) {
      console.error(
        "Delete membership error:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete membership");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button
        onClick={() => navigate("/admin")}
        className="mb-5 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add / Update Memberships</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Vendor ID"
            value={form.vendorId}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
            className="border p-3 rounded"
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-3 rounded"
          >
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="2years">2 Years</option>
          </select>

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
            onClick={handleSubmitMembership}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            {editId ? "Update Membership" : "Add Membership"}
          </button>

          {editId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5 overflow-x-auto">
        {memberships.length === 0 ? (
          <p>No memberships found</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Vendor ID</th>
                <th className="border p-3 text-left">Type</th>
                <th className="border p-3 text-left">Start Date</th>
                <th className="border p-3 text-left">End Date</th>
                <th className="border p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((item) => (
                <tr key={item._id}>
                  <td className="border p-3">{item.vendorId}</td>
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
                        onClick={() => handleEditMembership(item)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
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
  );
}