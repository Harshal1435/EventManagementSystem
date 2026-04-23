import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function CategoryVendors() {
  const navigate = useNavigate();
  const { category } = useParams();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, [category]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/user/vendors/${category}`);
      setVendors(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#e6e6e6] p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-[#cfcfcf] border border-gray-400 min-h-[600px] p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="bg-white border border-lime-500 px-10 py-3 text-xl hover:bg-gray-100"
          >
            Home
          </button>

          <div className="bg-[#4b74c7] text-white rounded-lg border border-[#365aa2] px-10 py-4 text-2xl min-w-[250px] text-center capitalize">
            Vendor &nbsp;&nbsp; {category}
          </div>

          <button
            onClick={handleLogout}
            className="bg-white border border-lime-500 px-10 py-3 text-xl hover:bg-red-100"
          >
            LogOut
          </button>
        </div>

        <div className="mt-12">
          {loading ? (
            <p className="text-center text-xl">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-center text-xl">No vendors found in this category</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
              {vendors.map((vendor, index) => (
                <div
                  key={vendor._id}
                  className="w-[180px] min-h-[255px] bg-[#4b74c7] rounded-[28px] border border-[#365aa2] text-white flex flex-col items-center justify-between py-6 px-4 shadow"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-medium">
                      Vendor {index + 1}
                    </h3>

                    <p className="mt-8 text-xl">{vendor.name}</p>

                    <p className="mt-4 text-sm break-all">
                      {vendor.email}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/user/vendor-items/${vendor._id}`)}
                    className="bg-white text-black border border-lime-500 px-6 py-3 text-lg hover:bg-gray-100"
                  >
                    Shop Item
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}