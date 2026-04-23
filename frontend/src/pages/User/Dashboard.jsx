import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("USER");
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchCategories();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUserName(res.data?.name?.toUpperCase() || "USER");
      console.log("User data:", res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/user/categories");
      console.log("Categories:", res.data);
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleCategoryClick = (category) => {
    navigate(`/user/vendors/${category.toLowerCase()}`);
  };

  const formatCategory = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#e6e6e6] p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-[220px]">
          {showDropdown && (
            <>
              <p className="text-2xl mb-3 ml-2">Drop Down</p>
              <div className="bg-[#93b5df] rounded-[28px] px-5 py-5 min-h-[275px] shadow-md border border-[#6d93c6]">
                <ul className="space-y-3 text-[18px] text-black">
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <li
                        key={index}
                        className="cursor-pointer hover:underline"
                        onClick={() => handleCategoryClick(category)}
                      >
                        * {formatCategory(category)}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700">No categories found</li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 bg-[#cfcfcf] border border-gray-400 min-h-[600px] px-4 md:px-6 py-4">
          <div className="bg-[#4b74c7] border border-[#365aa2] text-white text-center py-3 text-2xl md:text-3xl tracking-wide">
            WELCOME {userName}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 place-items-center">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-[150px] h-[58px] bg-[#4b74c7] text-white text-2xl rounded-2xl border border-[#365aa2] shadow hover:bg-[#3f63aa] transition"
            >
              Vendor
            </button>

            <button
              onClick={() => navigate("/user/cart")}
              className="w-[150px] h-[58px] bg-[#4b74c7] text-white text-2xl rounded-2xl border border-[#365aa2] shadow hover:bg-[#3f63aa] transition"
            >
              Cart
            </button>

            <button
              onClick={() => navigate("/guest-list")}
              className="w-[150px] h-[58px] bg-[#4b74c7] text-white text-2xl rounded-2xl border border-[#365aa2] shadow hover:bg-[#3f63aa] transition"
            >
              Guest List
            </button>

            <button
              onClick={() => navigate("/order-status")}
              className="w-[150px] h-[58px] bg-[#4b74c7] text-white text-2xl rounded-2xl border border-[#365aa2] shadow hover:bg-[#3f63aa] transition"
            >
              Order Status
            </button>
          </div>

          <div className="mt-24 flex justify-center">
            <button
              onClick={handleLogout}
              className="w-[150px] h-[58px] bg-[#4b74c7] text-white text-2xl rounded-2xl border border-[#365aa2] shadow hover:bg-red-600 transition"
            >
              LogOut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}