import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Cart() {
  const [cart,setCart]=useState({});

  const fetch=()=>{
    API.get("/cart").then(res=>setCart(res.data));
  };

  useEffect(fetch,[]);

  return (
    <div className="p-4">
      {cart.cart?.items?.map(i=>(
        <div key={i._id}>
          {i.productId.name} x {i.quantity}
        </div>
      ))}

      <h2>Total ₹{cart.total}</h2>

      <button onClick={() =>
        API.post("/orders",{products:cart.cart.items,totalAmount:cart.total})
      }>
        Checkout
      </button>
    </div>
  );
}