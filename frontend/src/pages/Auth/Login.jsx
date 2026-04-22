import { useState } from "react";
import API from "../../api/axios";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });

  const login = async () => {
    const res = await API.post("/auth/login", data);
    localStorage.setItem("token", res.data.token);

    const role = JSON.parse(atob(res.data.token.split(".")[1])).role;

    if (role === "admin") window.location.href = "/admin";
    if (role === "vendor") window.location.href = "/vendor";
    if (role === "user") window.location.href = "/user";
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-6 shadow rounded w-80">
        <input className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={e=>setData({...data,email:e.target.value})}/>
        <input type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          onChange={e=>setData({...data,password:e.target.value})}/>
        <button onClick={login}
          className="bg-blue-600 text-white w-full py-2">
          Login
        </button>
      </div>
    </div>
  );
}