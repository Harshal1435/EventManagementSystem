import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function AddNewItemPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [vendorName, setVendorName] = useState("Vendor Name");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
  });

  useEffect(() => {
    fetchVendorInfo();
    fetchProducts();
  }, []);

  const fetchVendorInfo = async () => {
    try {
      const res = await API.get("/auth/me");
      setVendorName(res.data?.name || "Vendor Name");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/vendor/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        price: Number(form.price),
      };

      if (editId) {
        await API.put(`/vendor/products/${editId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await API.post("/vendor/products", payload);
        toast.success("Product added successfully");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/vendor/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#d9d9d9] p-4 md:p-6">
      {/* TOP BAR */}
      <div className="w-full bg-[#4974c7] border border-[#2c4f96] px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-white text-lg md:text-2xl font-medium">
          Welcome &nbsp; '{vendorName}'
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/vendor/product-status")}
            className="bg-white text-black px-5 py-3 rounded-xl border border-lime-400 shadow hover:bg-gray-100 transition"
          >
            Product Status
          </button>

          <button
            onClick={() => navigate("/vendor/request-item")}
            className="bg-white text-black px-5 py-3 rounded-xl border border-lime-400 shadow hover:bg-gray-100 transition"
          >
            Request Item
          </button>

          <button
            onClick={() => navigate("/vendor/view-product")}
            className="bg-white text-black px-5 py-3 rounded-xl border border-lime-400 shadow hover:bg-gray-100 transition"
          >
            View Product
          </button>

          <button
            onClick={handleLogout}
            className="bg-white text-black px-5 py-3 rounded-xl border border-lime-400 shadow hover:bg-red-100 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-6">
        {/* LEFT FORM */}
        <div className="bg-[#4974c7] border border-[#2c4f96] p-6 md:p-8 min-h-[420px]">
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-14 rounded-xl bg-[#d9d9d9] px-4 text-center text-xl outline-none"
            />

            <input
              type="number"
              placeholder="Product Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full h-14 rounded-xl bg-[#d9d9d9] px-4 text-center text-xl outline-none"
            />

            <div className="w-full h-14 rounded-xl bg-[#d9d9d9] px-4 flex items-center justify-center text-xl">
              Product Image
            </div>

            <div className="pt-10 flex justify-center gap-4 flex-wrap">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-white px-8 py-3 rounded-xl text-xl font-medium shadow hover:bg-gray-100 transition disabled:opacity-60"
              >
                {loading
                  ? editId
                    ? "Updating..."
                    : "Adding..."
                  : editId
                  ? "Update Product"
                  : "Add The Product"}
              </button>

              {editId && (
                <button
                  onClick={resetForm}
                  className="bg-white px-8 py-3 rounded-xl text-xl font-medium shadow hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT TABLE */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#4974c7] border border-[#2c4f96] text-white text-center py-5 text-2xl">
                Product Image
              </div>
              <div className="bg-[#4974c7] border border-[#2c4f96] text-white text-center py-5 text-2xl">
                Product Name
              </div>
              <div className="bg-[#4974c7] border border-[#2c4f96] text-white text-center py-5 text-2xl">
                Product Price
              </div>
              <div className="bg-[#4974c7] border border-[#2c4f96] text-white text-center py-5 text-2xl">
                Action
              </div>
            </div>
           

            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-4 gap-4 items-center mb-5"
                >
                  <div className="bg-[#4974c7] border border-[#2c4f96] h-36 flex items-center justify-center text-white text-2xl">
                    Image
                  </div>

                  <div className="bg-[#4974c7] border border-[#2c4f96] h-16 flex items-center justify-center text-white text-2xl text-center px-2">
                    {product.name}
                  </div>

                  <div className="bg-[#4974c7] border border-[#2c4f96] h-16 flex items-center justify-center text-white text-2xl text-center px-2">
                    Rs/- {product.price}
                  </div>

                  <div className="border border-[#2c4f96] overflow-hidden">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-full bg-[#4974c7] text-white text-2xl py-4 border-b border-yellow-400 hover:bg-red-600 transition"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => handleEdit(product)}
                      className="w-full bg-[#4974c7] text-white text-2xl py-4 hover:bg-green-600 transition"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-gray-400 text-center py-10 text-gray-600 text-lg rounded-lg">
                No products added yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}