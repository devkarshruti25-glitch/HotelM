import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Premium Palette
  const colors = {
    pageBg: 'bg-[#FAF7F5]', // Creamy Off-White
    text: 'text-[#2C3E50]', // Deep Charcoal
    accent: 'bg-[#A37D40]', // Rich Bronze
    accentHover: 'hover:bg-[#906D38]', // Darker Bronze
    border: 'border-[#2C3E50]/30', // Charcoal border
    focusRing: 'focus:ring-[#A37D40]',
    focusBorder: 'focus:border-[#A37D40]',
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });

      if (response.data.success) {
        setToken(response.data.token);
        toast.success("Login successful.");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Please try again later.");
    }
  };

  return (
    <div className={`flex items-center justify-center w-full min-h-screen ${colors.pageBg} ${colors.text}`}>
      <div className="w-full max-w-md px-8 py-8 bg-white rounded-xl shadow-xl">
        <div className="w-fit mb-4 mx-auto">
          {/* Use the logo asset */}
          <img src={assets.logo} alt="Tasty Food Admin" className="w-32" />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-center">Admin Dashboard</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 min-w-72">
            <p className="mb-2 text-sm font-medium">Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className={`w-full px-3 py-2.5 border ${colors.border} rounded-lg outline-none transition duration-150 ${colors.focusBorder} ${colors.focusRing} focus:ring-1`}
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className={`w-full px-3 py-2.5 border ${colors.border} rounded-lg outline-none transition duration-150 ${colors.focusBorder} ${colors.focusRing} focus:ring-1`}
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className={`w-full px-4 py-3 mt-5 text-white ${colors.accent} ${colors.accentHover} rounded-lg font-semibold transition-colors duration-200`}
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

