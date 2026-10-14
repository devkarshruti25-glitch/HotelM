import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Navbar = ({ setToken }) => {
  return (
    // Replaced glassmorphism with a clean white, professional shadow
    <div className="top-0 left-0 z-50 w-full transition-all duration-300 bg-white shadow-lg">
      <div className="flex items-center py-3 px-[4%] justify-between">
        <Link to={"/"}>
          {/* Using a standard logo size */}
          <img className="w-36" src={assets.logo} alt="Tasty Food Admin" />
        </Link>
        <button
          onClick={() => setToken("")}
          // Using a rich red for the logout button with a hover effect
          className="px-5 py-2 text-xs font-semibold text-white bg-red-700 rounded-full sm:px-7 sm:text-sm hover:bg-red-800 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
