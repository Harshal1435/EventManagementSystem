// src/pages/vendor/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const p = await API.get("/vendor/products");
    const o = await API.get("/vendor/orders");

    setProducts(p.data);
    setOrders(o.data);
  };

  const addProduct = async () => {
    if (!form.name || !form.price) return alert("Fill required fields");
    await API.post("/vendor/products", form);
    setForm({ name: "", price: "", stock: "", description: "" });
    fetchData();
  };

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    fetchData();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Vendor Dashboard
      </h1>

      {/* ADD PRODUCT FORM */}
      <div className="bg-white p-5 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add Product
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <button
          onClick={addProduct}
          className="mt-4 bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCTS */}
      <div className="bg-white p-5 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          My Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products added</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                className="border rounded p-4 hover:shadow transition"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {p.name}
                </h3>

                <p className="text-gray-600 text-sm">
                  {p.description}
                </p>

                <p className="mt-2 font-medium">
                  ₹{p.price}
                </p>

                <p className="text-sm text-gray-500">
                  Stock: {p.stock}
                </p>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="mt-3 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDERS */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o._id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span className="text-gray-700 text-sm">
                  {o._id}
                </span>

                <span
                  className={`px-3 py-1 text-sm rounded ${
                    o.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}