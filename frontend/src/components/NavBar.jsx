import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const NavBar = () => {
    // State for the mobile menu visibility
    const [visible, setVisible] = useState(false);
    
    // Get context values
    const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems} = useContext(ShopContext);

    // Premium Color Palette
    const colors = {
      text: 'text-[#2C3E50]', // Deep Charcoal
      accent: 'text-[#A37D40]', // Rich Bronze
      accentBg: 'bg-[#A37D40]',
      accentBorder: 'border-[#A37D40]',
      background: 'bg-[#FAF7F5]', // Creamy Off-White
    };

    // Logout function
    const logout = () => {
        navigate('/login');
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
    }

    // CSS class for active NavLink
    const activeLinkClass = `${colors.accent} ${colors.accentBorder} border-b-2 font-semibold`;
    // CSS class for inactive NavLink
    const inactiveLinkClass = `hover:${colors.accent} transition-colors duration-200`;

  return (
    <>
        {/* Main Navbar Container */}
        <div className={`sticky top-0 z-50 flex items-center justify-between py-5 px-4 sm:px-8 md:px-12 ${colors.background} shadow-sm`}>
            
            {/* Logo */}
            <Link to='/'>
                <img src={assets.logo} className='w-32 md:w-36' alt="Tasty Food Logo" />
            </Link>

            {/* Desktop Navigation */}
            <ul className={`hidden sm:flex gap-6 md:gap-8 ${colors.text} text-sm font-medium tracking-wide`}>
                <NavLink 
                    to='/' 
                    className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
                >
                    HOME
                </NavLink>
                <NavLink 
                    to='/collection' 
                    className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
                >
                    MEALS
                </NavLink>
                <NavLink 
                    to='/about' 
                    className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
                >
                    ABOUT
                </NavLink>
                <NavLink 
                    to='/contact' 
                    className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
                >
                    CONTACT
                </NavLink>
            </ul>

            {/* Icons and Actions */}
            <div className='flex items-center gap-5 md:gap-7'>
                <img 
                    onClick={() => setShowSearch(true)} 
                    src={assets.search_icon} 
                    className='w-5 cursor-pointer transition-opacity hover:opacity-70' 
                    alt="Search"
                    aria-label="Open search bar"
                />
                
                {/* Profile Icon & Dropdown */}
                <div className='relative group'>
                    <img 
                        onClick={()=> token ? null : navigate('/login')} 
                        src={assets.profile_icon} 
                        className='w-5 cursor-pointer transition-opacity hover:opacity-70' 
                        alt="Profile"
                        aria-label="Profile and account options"
                    />
                    {token && (
                        <div className='absolute right-0 hidden pt-4 group-hover:block dropdown-menu z-10'>
                            <div className={`flex flex-col gap-3 px-6 py-4 ${colors.text} rounded-md w-48 bg-white shadow-lg border border-gray-100`}>
                                <p onClick={()=>navigate('/profile')} className={`cursor-pointer hover:${colors.accent}`}>Profile</p>
                                <p onClick={()=>navigate('/orders')} className={`cursor-pointer hover:${colors.accent}`}>Orders</p>
                                <hr className='border-gray-200' />
                                <p onClick={logout} className={`cursor-pointer hover:${colors.accent}`}>Logout</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Icon */}
                <Link to='/cart' className='relative' aria-label="View cart">
                    <img src={assets.cart_icon} className='w-5 min-w-5 transition-opacity hover:opacity-70' alt="Cart" />
                    <p className={`absolute top-[-8px] right-[-8px] w-4 h-4 text-center leading-4 ${colors.accentBg} text-white rounded-full text-[10px] font-bold`}>
                        {getCartCount()}
                    </p>
                </Link>

                {/* Mobile Menu Icon */}
                <img 
                    onClick={() => setVisible(true)} 
                    src={assets.menu_icon} 
                    className='w-5 cursor-pointer sm:hidden' 
                    alt="Menu Icon"
                    aria-label="Open mobile menu"
                />
            </div>
        </div>

        {/* --- Mobile Menu --- */}
        
        {/* Overlay */}
        <div 
            onClick={() => setVisible(false)}
            className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden="true"
        ></div>

        {/* Sidebar Panel */}
        <div className={`fixed top-0 right-0 bottom-0 z-[100] ${colors.background} w-full max-w-sm shadow-xl transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`flex flex-col ${colors.text}`}>
                {/* Back Button */}
                <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-6 cursor-pointer border-b border-gray-200'>
                    <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="Back" />
                    <p className='font-medium'>Back</p>
                </div>
                {/* Mobile Nav Links */}
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8 border-b border-gray-200' to='/'>HOME</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8 border-b border-gray-200' to='/collection'>MEALS</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8 border-b border-gray-200' to='/about'>ABOUT</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8 border-b border-gray-200' to='/contact'>CONTACT</NavLink>
            </div>
        </div>
    </>
  )
}

export default NavBar;
