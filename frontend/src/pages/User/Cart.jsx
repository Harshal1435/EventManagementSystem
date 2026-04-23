import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await API.get("/cart");
      console.log("Cart API Response:", res.data.cart.items);

      let items = [];

      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res.data?.items)) {
        items = res.data.items;
      } else if (Array.isArray(res.data?.cart)) {
        items = res.data.cart;
      }

      console.log("Final cart items:", items);
      setCartItems(res.data.cart.items);
    } catch (error) {
      console.error("Fetch cart error:", error);
      toast.error("Failed to load cart");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartId, quantity) => {
    try {
      setUpdatingId(cartId);

      await API.put(`/cart/${cartId}`, {
        quantity: Number(quantity),
      });

      toast.success("Quantity updated");
      fetchCart();
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error(error.response?.data?.msg || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await API.delete(`/cart/${cartId}`);
      toast.success("Item removed");
      fetchCart();
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error(error.response?.data?.msg || "Failed to remove item");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await API.delete("/cart");
      toast.success("Cart cleared");
      fetchCart();
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error(error.response?.data?.msg || "Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    try {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return toast.error("Cart is empty");
      }

      await API.post("/orders", {
        items: cartItems.map((item) => ({
          productId: item.productId?._id || item.productId || item.product?._id || item.product,
          quantity: item.quantity || item.qty || 1,
        })),
      });

      toast.success("Order placed successfully");
      fetchCart();
      navigate("/user/order-status");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.msg || "Checkout failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const grandTotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;

    return cartItems.reduce((sum, item) => {
      const product = item.productId || item.product || {};
      const price = Number(product?.price || item?.price || 0);
      const quantity = Number(item?.quantity || item?.qty || 1);
      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-[#d9d9d9] p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto bg-[#cfcfcf] border border-gray-400 min-h-[700px] p-4 md:p-6">
        {/* TOP BUTTONS */}
        <div className="flex flex-wrap justify-between gap-4">
          <button
            onClick={() => navigate("/user")}
            className="bg-white border border-lime-500 px-8 py-3 rounded-2xl text-xl hover:bg-gray-100 transition"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/user/products")}
            className="bg-white border border-lime-500 px-8 py-3 rounded-2xl text-xl hover:bg-gray-100 transition"
          >
            View Product
          </button>

          <button
            onClick={() => navigate("/user/request-item")}
            className="bg-white border border-lime-500 px-8 py-3 rounded-2xl text-xl hover:bg-gray-100 transition"
          >
            Request Item
          </button>

          <button
            onClick={() => navigate("/user/order-status")}
            className="bg-white border border-lime-500 px-8 py-3 rounded-2xl text-xl hover:bg-gray-100 transition"
          >
            Product Status
          </button>

          <button
            onClick={handleLogout}
            className="bg-white border border-lime-500 px-8 py-3 rounded-2xl text-xl hover:bg-red-100 transition"
          >
            LogOut
          </button>
        </div>

        {/* TITLE */}
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-[520px] bg-[#9ec0ea] border border-[#6d93c6] text-center text-2xl py-3">
            Shopping Cart
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Image
          </div>
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Name
          </div>
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Price
          </div>
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Quantity
          </div>
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Total Price
          </div>
          <div className="bg-[#4b74c7] text-white text-center py-5 rounded-2xl text-xl border border-[#365aa2]">
            Action
          </div>
        </div>

        {/* CART ITEMS */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center text-xl py-10">Loading cart...</div>
          ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
            <div className="text-center text-xl py-10 bg-white rounded-xl border border-dashed border-gray-400">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item, index) => {
                const product = item.productId || item.product || {};
                const price = Number(product?.price || item?.price || 0);
                const quantity = Number(item?.quantity || item?.qty || 1);
                const total = price * quantity;

                return (
                  <div
                    key={item._id || index}
                    className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 items-center"
                  >
                    {/* IMAGE */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center overflow-hidden px-2">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={product?.name || "Product"}
                          className="w-full h-full object-cover rounded-[22px]"
                        />
                      ) : (
                        <span className="text-xl">Image</span>
                      )}
                    </div>

                    {/* NAME */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center text-center text-xl px-3">
                      {product?.name || item?.name || "Product Name"}
                    </div>

                    {/* PRICE */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center text-xl px-3">
                      {price}/-
                    </div>

                    {/* QUANTITY */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center px-3">
                      <select
                        value={quantity}
                        disabled={updatingId === item._id}
                        onChange={(e) =>
                          handleQuantityChange(item._id, e.target.value)
                        }
                        className="bg-transparent text-white text-xl outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                          <option key={qty} value={qty} className="text-black">
                            {qty}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TOTAL */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center text-xl px-3">
                      {total}/-
                    </div>

                    {/* ACTION */}
                    <div className="bg-[#4b74c7] text-white rounded-[22px] border border-[#365aa2] min-h-[110px] flex items-center justify-center px-3">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-xl hover:text-red-200 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GRAND TOTAL */}
        <div className="mt-14 bg-[#4b74c7] border border-[#365aa2] text-white px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xl md:text-2xl">
          <div className="w-full md:w-auto text-center md:text-left">
            Grand Total
          </div>

          <div className="w-full md:w-auto text-center">{grandTotal}/-</div>

          <button
            onClick={handleDeleteAll}
            className="bg-white text-black border border-lime-500 px-8 py-2 rounded-lg hover:bg-red-100 transition"
          >
            Delete All
          </button>
        </div>

        {/* CHECKOUT */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleCheckout}
            className="w-full max-w-[460px] bg-white border border-lime-500 px-8 py-3 rounded-lg text-2xl hover:bg-gray-100 transition"
          >
            Proceed to CheckOut
          </button>
        </div>
      </div>
    </div>
  );
}