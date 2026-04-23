import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddItem() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/vendor/products", {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
      });

      toast.success("Product added successfully");

      setForm({
        name: "",
        price: "",
        stock: "",
        description: "",
      });

      navigate("/vendor");
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4f79c7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
          Add Product
        </h2>

        <input
          type="text"
          placeholder="Product Name"
          className="border p-3 rounded-lg mb-3 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          className="border p-3 rounded-lg mb-3 w-full"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          className="border p-3 rounded-lg mb-3 w-full"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          type="text"
          placeholder="Description"
          className="border p-3 rounded-lg mb-4 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/vendor")}
            className="w-1/2 bg-gray-300 text-black py-3 rounded-lg hover:bg-gray-400"
          >
            Back
          </button>

          <button
            onClick={handleAddProduct}
            disabled={loading}
            className="w-1/2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}