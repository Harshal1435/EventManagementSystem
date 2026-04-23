import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function AddNewItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const handleAddProduct = async () => {
    try {
      await API.post("/vendor/products", {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
      });

      toast.success("Product added");
      navigate("/vendor/product-status");
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-[#4f79c7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-5">Add New Item</h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          className="w-full border p-3 rounded mb-4"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button
          onClick={handleAddProduct}
          className="w-full bg-green-600 text-white py-3 rounded"
        >
          Add Product
        </button>
      </div>
    </div>
  );
}