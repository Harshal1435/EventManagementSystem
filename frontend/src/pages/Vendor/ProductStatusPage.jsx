import { useNavigate } from "react-router-dom";

export default function ProductStatusPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Product Status</h1>
        <p className="text-gray-600 mb-6">Product added successfully.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/vendor/request-item")}
            className="bg-blue-600 text-white py-3 rounded"
          >
            Request Item
          </button>

          <button
            onClick={() => navigate("/vendor/view-product")}
            className="bg-green-600 text-white py-3 rounded"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
}