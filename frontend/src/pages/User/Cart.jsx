import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Trash2, Package, ArrowRight,
  CreditCard, CheckCircle, XCircle, Minus, Plus,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

// ── Steps: cart → payment → total → done ─────────────────
const STEPS = ["Cart", "Payment", "Total Amount", "Confirm"];

export default function Cart() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0); // 0=cart, 1=payment, 2=total, 3=done
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [placing, setPlacing]     = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [userName, setUserName]   = useState("User");
  const [placedOrder, setPlacedOrder] = useState(null);

  // Payment form state
  const [payment, setPayment] = useState({
    method: "card",
    cardNumber: "", expiry: "", cvv: "", name: "",
    upiId: "",
  });

  useEffect(() => {
    API.get("/auth/me").then(r => setUserName(r.data?.name || "User")).catch(() => {});
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cart");
      const items = res.data?.cart?.items || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setCartItems(items);
    } catch { toast.error("Failed to load cart"); setCartItems([]); }
    finally { setLoading(false); }
  };

  const handleQty = async (id, delta) => {
    const item = cartItems.find(i => i._id === id);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    try {
      setUpdatingId(id);
      await API.put(`/cart/${id}`, { quantity: newQty });
      fetchCart();
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
    finally { setUpdatingId(null); }
  };

  const handleRemove = async (id) => {
    try { await API.delete(`/cart/${id}`); toast.success("Removed"); fetchCart(); }
    catch { toast.error("Failed to remove item"); }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try { await API.delete("/cart/clear"); toast.success("Cart cleared"); fetchCart(); }
    catch { toast.error("Failed"); }
  };

  const grandTotal = useMemo(() => cartItems.reduce((sum, item) => {
    const product = item.productId || item.product || {};
    return sum + Number(product?.price || item?.price || 0) * Number(item?.quantity || 1);
  }, 0), [cartItems]);

  // Step 1 → 2: validate payment form
  const handlePaymentNext = () => {
    if (payment.method === "card") {
      if (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.name)
        return toast.error("Please fill all card details");
    } else if (payment.method === "upi") {
      if (!payment.upiId) return toast.error("Please enter UPI ID");
    }
    setStep(2);
  };

  // Step 2 → 3: place order
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return toast.error("Cart is empty");
    try {
      setPlacing(true);
      const res = await API.post("/orders", {
        items: cartItems.map(item => ({
          productId: item.productId?._id || item.productId,
          quantity:  item.quantity || 1,
        })),
      });
      setPlacedOrder(res.data);
      toast.success("Order placed successfully! 🎉");
      fetchCart();
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Order failed");
    } finally { setPlacing(false); }
  };

  // Cancel — go back to cart step
  const handleCancel = () => {
    setStep(0);
    setPayment({ method: "card", cardNumber: "", expiry: "", cvv: "", name: "", upiId: "" });
  };

  return (
    <DashboardLayout role="user" userName={userName}>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              i === step
                ? "bg-indigo-600 text-white"
                : i < step
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-400"
            }`}>
              {i < step ? <CheckCircle size={12} /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          STEP 0 — CART
      ══════════════════════════════════════════ */}
      {step === 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Shopping Cart</h2>
              <p className="text-slate-500 text-sm">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
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
              <p className="text-slate-400 text-sm mb-6">Browse vendors and add products to get started</p>
              <button onClick={() => navigate("/user/products")}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                Browse Products <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-3">
                {cartItems.map((item, i) => {
                  const product = item.productId || item.product || {};
                  const price   = Number(product?.price || item?.price || 0);
                  const qty     = Number(item?.quantity || 1);
                  return (
                    <div key={item._id || i} className="card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-indigo-400 sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{product?.name || "Product"}</p>
                        <p className="text-indigo-600 font-bold text-sm">₹{price}</p>
                      </div>
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQty(item._id, -1)} disabled={updatingId === item._id || qty <= 1}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition disabled:opacity-40">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-slate-800">{qty}</span>
                          <button onClick={() => handleQty(item._id, 1)} disabled={updatingId === item._id}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition disabled:opacity-40">
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">₹{price * qty}</p>
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
              <div className="card p-5 sm:p-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-bold text-slate-800 mb-4">Summary</h3>
                <div className="space-y-2 mb-5 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800">
                    <span>Total</span>
                    <span className="text-indigo-600 text-lg">₹{grandTotal}</span>
                  </div>
                </div>
                <button onClick={() => setStep(1)}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  Proceed to Payment <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          STEP 1 — PAYMENT
      ══════════════════════════════════════════ */}
      {step === 1 && (
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Payment</h2>

          <div className="card p-6 space-y-5">
            {/* Method selector */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "card", label: "💳 Card" },
                  { value: "upi",  label: "📱 UPI"  },
                  { value: "cod",  label: "💵 COD"  },
                ].map(m => (
                  <button key={m.value} onClick={() => setPayment(p => ({ ...p, method: m.value }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                      payment.method === m.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card fields */}
            {payment.method === "card" && (
              <div className="space-y-3">
                <input placeholder="Cardholder Name" value={payment.name}
                  onChange={e => setPayment(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                <input placeholder="Card Number (16 digits)" maxLength={19} value={payment.cardNumber}
                  onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim() }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition font-mono" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM/YY" maxLength={5} value={payment.expiry}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                      setPayment(p => ({ ...p, expiry: v }));
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition font-mono" />
                  <input placeholder="CVV" maxLength={3} type="password" value={payment.cvv}
                    onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "") }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition font-mono" />
                </div>
              </div>
            )}

            {/* UPI field */}
            {payment.method === "upi" && (
              <input placeholder="Enter UPI ID (e.g. name@upi)" value={payment.upiId}
                onChange={e => setPayment(p => ({ ...p, upiId: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            )}

            {/* COD info */}
            {payment.method === "cod" && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-amber-700 text-sm font-medium">Cash on Delivery</p>
                <p className="text-amber-600 text-xs mt-1">Pay ₹{grandTotal} when your order arrives.</p>
              </div>
            )}

            {/* Amount preview */}
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
              <span className="text-sm text-slate-600">Amount to pay</span>
              <span className="font-bold text-indigo-700 text-lg">₹{grandTotal}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handlePaymentNext}
                className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <CreditCard size={15} /> Review Order
              </button>
              <button onClick={handleCancel}
                className="px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
                <XCircle size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 2 — TOTAL AMOUNT (review)
      ══════════════════════════════════════════ */}
      {step === 2 && (
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Total Amount</h2>

          <div className="card p-6 space-y-4">
            {/* Items breakdown */}
            <div className="space-y-2">
              {cartItems.map((item, i) => {
                const product = item.productId || item.product || {};
                const price   = Number(product?.price || item?.price || 0);
                const qty     = Number(item?.quantity || 1);
                return (
                  <div key={item._id || i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Package size={13} className="text-indigo-400" />
                      </div>
                      <span className="text-slate-700 truncate max-w-[180px]">{product?.name || "Product"}</span>
                      <span className="text-slate-400 text-xs">×{qty}</span>
                    </div>
                    <span className="font-semibold text-slate-800">₹{price * qty}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span><span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span>
                <span className="capitalize font-medium text-slate-700">
                  {payment.method === "card" ? "💳 Card" : payment.method === "upi" ? "📱 UPI" : "💵 COD"}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800 text-base">
                <span>Total</span>
                <span className="text-indigo-600 text-xl">₹{grandTotal}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handlePlaceOrder} disabled={placing}
                className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {placing
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Placing...</>
                  : <><CheckCircle size={15} /> Place Order</>
                }
              </button>
              <button onClick={handleCancel}
                className="px-5 py-3 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center gap-2">
                <XCircle size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 3 — ORDER CONFIRMED
      ══════════════════════════════════════════ */}
      {step === 3 && (
        <div className="max-w-md mx-auto text-center">
          <div className="card p-10">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h2>
            <p className="text-slate-500 text-sm mb-1">Your order has been placed successfully.</p>
            {placedOrder && (
              <p className="text-slate-400 text-xs font-mono mb-6">
                Order ID: #{placedOrder._id?.slice(-10)}
              </p>
            )}
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-indigo-700">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="font-medium text-slate-700 capitalize">
                  {payment.method === "card" ? "Card" : payment.method === "upi" ? "UPI" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-amber-600">Pending</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/user/orders")}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                Check Status <ArrowRight size={14} />
              </button>
              <button onClick={() => { setStep(0); setPlacedOrder(null); }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
