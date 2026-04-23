import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  const addToCart = async (productId) => {
    try {
      setLoadingId(productId);

      await API.post("/cart", {
        productId,
        quantity: 1,
      });

      toast.success("Added to cart 🛒");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
        All Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 p-4 flex flex-col justify-between"
          >
            {/* IMAGE */}
            <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>

            {/* NAME */}
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              {p.name}
            </h2>

            {/* PRICE */}
            <p className="text-center text-blue-600 font-bold mt-2 text-lg">
              ₹ {p.price}
            </p>

            {/* STATUS */}
            {p.status && (
              <p className="text-center text-sm mt-1 capitalize text-gray-500">
                {p.status}
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={() => addToCart(p._id)}
              disabled={loadingId === p._id}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingId === p._id ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}