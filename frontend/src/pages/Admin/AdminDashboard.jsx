import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-[#cfcfcf] px-4 py-6">
      <div className="max-w-7xl mx-auto min-h-[90vh] border border-gray-400 bg-[#cfcfcf] p-4 md:p-6">
        {/* top row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="w-[120px] md:w-[160px] h-[50px] bg-white border-2 border-lime-500 rounded-xl text-black text-lg font-medium hover:bg-gray-50 transition"
          >
            Home
          </button>

          <button
            onClick={handleLogout}
            className="w-[120px] md:w-[160px] h-[50px] bg-white border-2 border-lime-500 rounded-xl text-black text-lg font-medium hover:bg-gray-50 transition"
          >
            LogOut
          </button>
        </div>

        {/* welcome box */}
        <div className="flex justify-center mt-8 md:mt-10">
          <div className="w-full max-w-[520px] h-[60px] bg-white border-2 border-lime-500 rounded-xl flex items-center justify-center shadow-sm">
            <h1 className="text-xl md:text-3xl font-medium text-black">
              Welcome Admin
            </h1>
          </div>
        </div>

        {/* action buttons */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 place-items-center">
          <button
            onClick={() => navigate("/admin/users")}
            className="w-[220px] md:w-[260px] h-[70px] bg-white border-2 border-lime-500 rounded-xl text-black text-xl font-medium hover:bg-gray-50 transition shadow-sm"
          >
            Maintain User
          </button>

          <button
            onClick={() => navigate("/admin/vendors")}
            className="w-[220px] md:w-[260px] h-[70px] bg-white border-2 border-lime-500 rounded-xl text-black text-xl font-medium hover:bg-gray-50 transition shadow-sm"
          >
            Maintain Vendor
          </button>
        </div>
      </div>
    </div>
  );
}