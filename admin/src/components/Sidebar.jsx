import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";

const Sidebar = () => {
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending count to show dynamic badge
    useEffect(() => {
        const fetchPendingCount = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(backendUrl + '/api/order/admin/stats', { headers: { token } });
                if (res.data.success && res.data.stats) {
                    setPendingCount(res.data.stats.upiPendingCount || 0);
                }
            } catch (e) {
                // Ignore silent stats fetch error
            }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 15000); // Polling every 15s for new pending orders
        return () => clearInterval(interval);
    }, []);

    const navLinkBase =
        "flex items-center justify-between border border-transparent px-3 py-3 rounded-lg text-[#2C3E50] hover:bg-gray-200 transition-colors duration-200 text-sm font-semibold";

    const navLinkActive =
        "flex items-center justify-between border border-transparent px-3 py-3 rounded-lg bg-[#A37D40] text-white text-sm font-semibold shadow-sm";

    return (
        <div className="w-[20%] sm:w-[18%] min-h-screen border-r border-gray-200 bg-[#FAF7F5]">
            <div className="flex flex-col gap-2.5 pt-8 pl-[10%] pr-[10%]">
                {/* 1. Payment Verification (Dedicated Section) */}
                <NavLink
                    className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
                    to={"/verify-payments"}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">💳</span>
                        <p className="hidden md:block">Verification</p>
                    </div>
                    {pendingCount > 0 && (
                        <span className="hidden md:flex bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                </NavLink>

                {/* 2. All Orders */}
                <NavLink
                    className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
                    to={"/orders"}
                >
                    <div className="flex items-center gap-3">
                        <img className="w-5 h-5" src={assets.order_icon} alt="View Orders" />
                        <p className="hidden md:block">All Orders</p>
                    </div>
                </NavLink>

                {/* 3. Add Items */}
                <NavLink
                    className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
                    to={"/add"}
                >
                    <div className="flex items-center gap-3">
                        <img className="w-5 h-5" src={assets.add_icon} alt="Add Items" />
                        <p className="hidden md:block">Add Items</p>
                    </div>
                </NavLink>

                {/* 4. List Items */}
                <NavLink
                    className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
                    to={"/list"}
                >
                    <div className="flex items-center gap-3">
                        <img className="w-5 h-5" src={assets.parcel_icon} alt="List Items" />
                        <p className="hidden md:block">List Items</p>
                    </div>
                </NavLink>

                {/* 5. UPI Settings */}
                <NavLink
                    className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
                    to={"/upi-settings"}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚙️</span>
                        <p className="hidden md:block">UPI Settings</p>
                    </div>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
