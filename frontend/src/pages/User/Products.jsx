import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(()=>{
    API.get("/products").then(res=>setProducts(res.data));
  },[]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {products.map(p=>(
        <div key={p._id} className="border p-2">
          {p.name} ₹{p.price}
          <button onClick={() =>
            API.post("/cart",{productId:p._id,quantity:1})
          }>
            Add
          </button>
        </div>
      ))}
    </div>
  );
}