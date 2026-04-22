import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ REQUIRED
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>   {/* ✅ THIS FIXES ERROR */}
    <App />
  </BrowserRouter>
);