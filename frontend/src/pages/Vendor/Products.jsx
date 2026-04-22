import { useEffect, useState } from "react";
import API from "../../api/axios";
import Layout from "../../components/Layout";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });

  const fetch = () => {
    API.get("/products/my").then(res => setProducts(res.data));
  };

  useEffect(fetch, []);

  const add = async () => {
    await API.post("/products", form);
    fetch();
  };

  return (
    <Layout links={[{name:"Products",path:"/vendor/products"}]}>
      <input placeholder="Name"
        onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Price"
        onChange={e=>setForm({...form,price:e.target.value})}/>
      <button onClick={add}>Add</button>

      {products.map(p=>(
        <div key={p._id}>
          {p.name} ₹{p.price}
        </div>
      ))}
    </Layout>
  );
}