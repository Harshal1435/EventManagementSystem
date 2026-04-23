import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function InsertItemPage() {
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
      toast.error("Failed to load items");
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

      <h1 className="text-3xl font-bold mb-6">Your Item</h1>

      <div className="bg-white rounded-xl shadow p-5 overflow-x-auto">
        {products.length === 0 ? (
          <p>No items found</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Price</th>
                <th className="border p-3 text-left">Stock</th>
                <th className="border p-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id}>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">₹{item.price}</td>
                  <td className="border p-3">{item.stock}</td>
                  <td className="border p-3">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/vendor/add-new-item")}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            Insert
          </button>

          <button
            onClick={() => navigate("/vendor/delete")}
            className="bg-red-500 text-white px-5 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}