import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function VendorItems() {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorProducts();
  }, [vendorId]);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/user/vendor-products/${vendorId}`);
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vendor items");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart", {
        productId,
        quantity: 1,
      });
      toast.success("Item added to cart");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Failed to add item");
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e6e6] p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-[#cfcfcf] border border-gray-400 min-h-[600px] p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-lime-500 px-10 py-3 text-xl hover:bg-gray-100"
          >
            Back
          </button>

          <div className="bg-[#4b74c7] text-white rounded-lg border border-[#365aa2] px-10 py-4 text-2xl min-w-[250px] text-center">
            Vendor Items
          </div>

          <button
            onClick={() => navigate("/user/cart")}
            className="bg-white border border-lime-500 px-10 py-3 text-xl hover:bg-gray-100"
          >
            Cart
          </button>
        </div>

        <div className="mt-12">
          {loading ? (
            <p className="text-center text-xl">Loading items...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-xl">No items found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-[#4b74c7] rounded-[24px] border border-[#365aa2] text-white p-5 shadow"
                >
                  <div className="bg-white/20 h-32 rounded-lg flex items-center justify-center text-xl mb-4">
                    Image
                  </div>

                  <h3 className="text-2xl text-center">{product.name}</h3>
                  <p className="text-center mt-3 text-xl">Rs/- {product.price}</p>
                  <p className="text-center mt-2 capitalize">{product.status}</p>
{console.log("Product status:", product._id, product.status)}
                  <button
                    onClick={() => addToCart(product._id)}
                    className="w-full mt-5 bg-white text-black border border-lime-500 px-4 py-3 text-lg hover:bg-gray-100"
                  >
                    Add To Cart
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