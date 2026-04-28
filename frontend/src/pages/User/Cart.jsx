import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Package, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try { setLoading(true);
      const res = await API.get("/cart");
      const items = res.data?.cart?.items || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setCartItems(items);
    } catch { toast.error("Failed to load cart"); setCartItems([]); }
    finally { setLoading(false); }
  };

  const handleQty = async (id, qty) => {
    try { setUpdatingId(id); await API.put(`/cart/${id}`, { quantity: Number(qty) }); fetchCart(); }
    catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
    finally { setUpdatingId(null); }
  };

  const handleRemove = async (id) => {
    try { await API.delete(`/cart/${id}`); toast.success("Removed"); fetchCart(); }
    catch { toast.error("Failed"); }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear cart?")) return;
    try { await API.delete("/cart/clear"); toast.success("Cart cleared"); fetchCart(); }
    catch { toast.error("Failed"); }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) return toast.error("Cart is empty");
    try {
      await API.post("/orders", {
        items: cartItems.map(item => ({
          productId: item.productId?._id || item.productId || item.product?._id || item.product,
          quantity: item.quantity || 1,
        })),
      });
      toast.success("Order placed! 🎉");
      fetchCart();
      navigate("/user/orders");
    } catch (err) { toast.error(err.response?.data?.msg || "Checkout failed"); }
  };

  const grandTotal = useMemo(() => cartItems.reduce((sum, item) => {
    const product = item.productId || item.product || {};
    return sum + Number(product?.price || item?.price || 0) * Number(item?.quantity || 1);
  }, 0), [cartItems]);

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Shopping Cart</h2>
          <p className="text-slate-500 text-sm">{cartItems.length} items</p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition">
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading cart...</div>
      ) : !cartItems.length ? (
        <div className="card p-16 text-center">
          <ShoppingCart size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">Your cart is empty</p>
          <p className="text-slate-400 text-sm mb-6">Add some products to get started</p>
          <button onClick={() => navigate("/user/products")}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            Browse Products <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, i) => {
              const product = item.productId || item.product || {};
              const price = Number(product?.price || item?.price || 0);
              const qty = Number(item?.quantity || 1);
              return (
                <div key={item._id || i} className="card p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Package size={22} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{product?.name || "Product"}</p>
                    <p className="text-indigo-600 font-bold">₹{price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={qty} disabled={updatingId === item._id}
                      onChange={e => handleQty(item._id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50 text-slate-800">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <p className="font-bold text-slate-800 text-sm w-16 text-right">₹{price * qty}</p>
                    <button onClick={() => handleRemove(item._id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit">
            <h3 className="font-bold text-slate-800 mb-5">Order Summary</h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span className="text-indigo-600 text-lg">₹{grandTotal}</span>
              </div>
            </div>
            <button onClick={handleCheckout}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              Place Order <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
