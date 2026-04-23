import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function VendorDashboard() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#4f79c7] flex flex-col items-center pt-12 px-4">
      <div className="w-full max-w-4xl bg-[#d9d9d9] text-center py-5 rounded shadow">
        <h1 className="text-2xl font-semibold text-black">Main Page</h1>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <button
          onClick={() => navigate("/vendor/insert")}
          className="bg-white p-6 rounded-xl shadow text-xl font-medium hover:bg-gray-100"
        >
          Your Item
        </button>

        <button
          onClick={() => navigate("/vendor/add-new-item")}
          className="bg-white p-6 rounded-xl shadow text-xl font-medium hover:bg-gray-100"
        >
          Add New Item
        </button>

        <button
          onClick={() => navigate("/vendor/transaction")}
          className="bg-white p-6 rounded-xl shadow text-xl font-medium hover:bg-gray-100"
        >
          Transaction
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600"
      >
        LogOut
      </button>
    </div>
  );
}