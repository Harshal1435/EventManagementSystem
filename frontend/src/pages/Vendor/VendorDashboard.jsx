import { useNavigate } from "react-router-dom";

export default function VendorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#4f79c7] flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-4xl bg-[#d9d9d9] text-center py-4 rounded-md shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Vendor Main Page</h1>
      </div>

      <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <button
          onClick={() => navigate("/vendor/items")}
          className="bg-[#d9d9d9] py-6 rounded-xl shadow text-xl font-medium hover:bg-gray-200 transition"
        >
          Your Item
        </button>

        <button
          onClick={() => navigate("/vendor/add-item")}
          className="bg-[#d9d9d9] py-6 rounded-xl shadow text-xl font-medium hover:bg-gray-200 transition"
        >
          Add New Item
        </button>

        <button
          onClick={() => navigate("/vendor/transaction")}
          className="bg-[#d9d9d9] py-6 rounded-xl shadow text-xl font-medium hover:bg-gray-200 transition"
        >
          Transaction
        </button>
      </div>
    </div>
  );
}