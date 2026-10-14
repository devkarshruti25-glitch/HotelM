import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {

    const {search, setSearch, showSearch, setShowSearch} = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    // Premium Color Palette
    const colors = {
      background: 'bg-[#FAF7F5]', // Creamy Off-White
      text: 'text-[#2C3E50]', // Deep Charcoal
      placeholder: 'placeholder:text-[#2C3E50]/60',
      border: 'border-[#2C3E50]/40',
      subtleBorder: 'border-[#2C3E50]/10',
      hover: 'hover:bg-[#2C3E50]/10'
    };

    useEffect(() => {
        // Show search bar only on collection page
        if (location.pathname.includes('collection')) {
            setVisible(true)
        } else {
            setVisible(false)
            setShowSearch(false) // Optionally hide search when navigating away
        }
    }, [location]);

  // Render only if both flags are true
  return showSearch && visible ? (
    <div className={`text-center border-t border-b ${colors.background} ${colors.subtleBorder} py-4 px-4`}>
        <div className={`inline-flex items-center justify-center w-full max-w-lg px-5 py-2.5 border ${colors.border} rounded-full`}>
            <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className={`flex-1 text-sm outline-none bg-inherit ${colors.text} ${colors.placeholder}`}
                type="text" 
                placeholder='Search for a specific dish...' 
            />
            <img className='w-4 ml-2' src={assets.search_icon} alt="Search" />
        </div>
        {/* Improved close button for better UX */}
        <button 
            onClick={() => setShowSearch(false)} 
            className={`inline-block p-2 ml-2 rounded-full align-middle ${colors.hover} transition-colors duration-150`}
            aria-label="Close search bar"
        >
            <img 
                className='w-3' 
                src={assets.cross_icon} 
                alt="Close" 
            />
        </button>
    </div>
  ) : null
}

export default SearchBar
