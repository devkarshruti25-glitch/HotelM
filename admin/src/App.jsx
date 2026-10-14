import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import PaymentVerification from "./pages/PaymentVerification";
import UpiSettings from "./pages/UpiSettings";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const currency = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr className="border-t border-[#2C3E50]/10" />
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 p-6 md:p-8 text-[#2C3E50] overflow-x-hidden">
              <Routes>
                <Route path="/" element={<PaymentVerification token={token} />} />
                <Route path="/verify-payments" element={<PaymentVerification token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/upi-settings" element={<UpiSettings token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
