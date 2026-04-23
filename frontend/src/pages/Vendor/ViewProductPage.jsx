import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ViewProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/vendor/products");
      setProducts(res.data.products || res.data || []);
    } catch (error) {
      toast.error("Failed to load products");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button
        onClick={() => navigate("/vendor")}
        className="mb-5 bg-blue-600 text-white px-5 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">View Product</h1>

      <div className="grid md:grid-cols-3 gap-5">
        {products.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="mt-2 text-gray-600">{item.description}</p>
            <p className="mt-3 font-bold text-blue-600">₹{item.price}</p>
            <p className="mt-1 text-sm text-gray-500">Stock: {item.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}