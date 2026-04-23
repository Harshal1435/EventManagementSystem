import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function AddNewItemPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/vendor/products");
      setProducts(res.data.products || res.data || []);
    } catch (error) {
      console.error("Fetch products error:", error.response?.data || error.message);
      toast.error("Failed to load products");
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.image) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/vendor/products", {
        name: form.name,
        price: Number(form.price),
        image: form.image,
      });

      toast.success("Product added");

      setForm({
        name: "",
        price: "",
        image: "",
      });

      fetchProducts();
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await API.delete(`/vendor/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to delete product");
    }
  };

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
    <div className="min-h-screen bg-[#d4d4d4] p-3 md:p-4">
      <div className="max-w-[1280px] mx-auto min-h-[92vh] border border-gray-500 bg-[#cfcfcf] p-3 md:p-4">
        {/* Top Header */}
        <div className="bg-[#4a76c5] border-2 border-[#345da7] px-3 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-white text-xl md:text-3xl font-medium">
            Welcome&nbsp;&nbsp; 'Vendor Name'
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/vendor/product-status")}
              className="bg-white border-2 border-lime-500 rounded-xl px-5 py-3 text-black text-lg hover:bg-gray-100"
            >
              Product Status
            </button>

            <button
              onClick={() => navigate("/vendor/request-item")}
              className="bg-white border-2 border-lime-500 rounded-xl px-5 py-3 text-black text-lg hover:bg-gray-100"
            >
              Request Item
            </button>

            <button
              onClick={() => navigate("/vendor/view-product")}
              className="bg-white border-2 border-lime-500 rounded-xl px-5 py-3 text-black text-lg hover:bg-gray-100"
            >
              View Product
            </button>

            <button
              onClick={handleLogout}
              className="bg-white border-2 border-lime-500 rounded-xl px-5 py-3 text-black text-lg hover:bg-gray-100"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Main Section */}
        <div className="mt-5 grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-8 items-start">
          {/* Left Add Form */}
          <div className="bg-[#4a76c5] border-2 border-[#345da7] p-5 md:p-6 min-h-[310px]">
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#d9d9d9] text-center text-xl border border-gray-300 rounded-xl px-4 py-4 outline-none"
              />

              <input
                type="number"
                placeholder="Product Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-[#d9d9d9] text-center text-xl border border-gray-300 rounded-xl px-4 py-4 outline-none"
              />

              <input
                type="text"
                placeholder="Product Image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full bg-[#d9d9d9] text-center text-xl border border-gray-300 rounded-xl px-4 py-4 outline-none"
              />
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="bg-white border border-gray-300 rounded-xl px-10 py-3 text-2xl text-black hover:bg-gray-100 disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add The Product"}
              </button>
            </div>
          </div>

          {/* Right Product Table Preview */}
          <div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-[#4a76c5] border-2 border-[#345da7] text-white text-center text-xl py-5">
                Product Image
              </div>
              <div className="bg-[#4a76c5] border-2 border-[#345da7] text-white text-center text-xl py-5">
                Product Name
              </div>
              <div className="bg-[#4a76c5] border-2 border-[#345da7] text-white text-center text-xl py-5">
                Product Price
              </div>
              <div className="bg-[#4a76c5] border-2 border-[#345da7] text-white text-center text-xl py-5">
                Action
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-600">
                No products found
              </div>
            ) : (
              <div className="space-y-5">
                {products.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-4 gap-4 items-stretch"
                  >
                    <div className="bg-[#4a76c5] border-2 border-[#345da7] min-h-[135px] flex items-center justify-center text-white text-2xl">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "Image"
                      )}
                    </div>

                    <div className="bg-[#4a76c5] border-2 border-[#345da7] flex items-center justify-center text-white text-2xl px-2 text-center">
                      {item.name || "Image Name"}
                    </div>

                    <div className="bg-[#4a76c5] border-2 border-[#345da7] flex items-center justify-center text-white text-2xl px-2 text-center">
                      Rs/{item.price || "-"}
                    </div>

                    <div className="flex flex-col">
                      <button
                        onClick={() => handleDeleteProduct(item._id)}
                        className="flex-1 bg-[#4a76c5] border-2 border-[#345da7] text-white text-2xl hover:bg-[#3f67ad]"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => navigate("/vendor/view-product")}
                        className="flex-1 bg-[#4a76c5] border-2 border-[#345da7] border-t-0 text-white text-2xl hover:bg-[#3f67ad]"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}