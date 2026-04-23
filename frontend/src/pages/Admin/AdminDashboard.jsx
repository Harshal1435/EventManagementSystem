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
    <div className="min-h-screen bg-gradient-to-br from-[#4f79c7] to-[#2c3e50] px-4 py-6">
      <div className="max-w-7xl mx-auto min-h-[90vh] backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
        
        {/* top row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="w-[120px] md:w-[160px] h-[50px] bg-white/90 backdrop-blur border border-lime-400 rounded-xl text-black text-lg font-semibold shadow-md hover:scale-105 hover:bg-white transition duration-300"
          >
            Home
          </button>

          <button
            onClick={handleLogout}
            className="w-[120px] md:w-[160px] h-[50px] bg-white/90 backdrop-blur border border-red-400 rounded-xl text-black text-lg font-semibold shadow-md hover:scale-105 hover:bg-red-50 transition duration-300"
          >
            LogOut
          </button>
        </div>

        {/* welcome box */}
        <div className="flex justify-center mt-10">
          <div className="w-full max-w-[520px] h-[70px] bg-white/90 backdrop-blur border border-lime-400 rounded-2xl flex items-center justify-center shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
              Welcome Admin 👋
            </h1>
          </div>
        </div>

        {/* action buttons */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 place-items-center">
          
          <button
            onClick={() => navigate("/admin/users")}
            className="w-[240px] md:w-[280px] h-[80px] bg-white/90 backdrop-blur border border-lime-400 rounded-2xl text-black text-xl font-semibold shadow-lg hover:scale-110 hover:bg-lime-50 transition duration-300"
          >
            👤 Maintain User
          </button>

          <button
            onClick={() => navigate("/admin/vendors")}
            className="w-[240px] md:w-[280px] h-[80px] bg-white/90 backdrop-blur border border-lime-400 rounded-2xl text-black text-xl font-semibold shadow-lg hover:scale-110 hover:bg-lime-50 transition duration-300"
          >
            🏪 Maintain Vendor
          </button>

        </div>
      </div>
    </div>
  );
}