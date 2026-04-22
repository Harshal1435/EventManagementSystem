import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productRes = await API.get("/products/vendor");
      const orderRes = await API.get("/orders/vendor");

      console.log("PRODUCTS:", productRes.data);
      console.log("ORDERS:", orderRes.data);

      setProducts(productRes.data || []);
      setOrders(orderRes.data || []);

      setStats({
        products: productRes.data.length,
        orders: orderRes.data.length,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ➕ ADD PRODUCT
  const addProduct = async () => {
    try {
      await API.post("/products", form);
      alert("Product added");

      setForm({
        name: "",
        price: "",
        description: "",
        stock: "",
      });

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE PRODUCT
  const deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return;

    try {
      await API.delete(`/products/${id}`);
      alert("Product deleted");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-xl font-bold">{stats.products}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">{stats.orders}</h2>
        </div>

      </div>

      {/* ADD PRODUCT */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            className="border p-2"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-2"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <input
            className="border p-2"
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <input
            className="border p-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

        </div>

        <button
          onClick={addProduct}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCTS LIST */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">My Products</h2>

        {products.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.price}</td>
                  <td className="border p-2">{p.stock}</td>

                  <td className="border p-2">
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products found</p>
        )}
      </div>

      {/* ORDERS */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Orders</h2>

        {orders.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="border p-2">{o._id}</td>
                  <td className="border p-2">{o.status}</td>
                  <td className="border p-2">{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found</p>
        )}
      </div>

    </div>
  );
}