import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Footer = () => {
    // Premium Color Palette:
    // Deep Charcoal: #2C3E50 (Primary Text/Headings)
    // Rich Bronze: #A37D40 (Accents/Highlights)
    // Creamy Off-White: #FAF7F5 (Implicit background)

  return (
    <div className='bg-[#FAF7F5] pt-10 px-4 sm:px-8'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 text-sm'>
            
            {/* Column 1: Brand & Description */}
            <div>
                <Link to='/'>
                    {/* Assuming assets.logo is updated to fit the Tasty Food brand and colors */}
                    <img src={assets.logo} className='w-32 mb-5 cursor-pointer' alt="Tasty Food Logo" />
                </Link>
                <p className='w-full text-[#2C3E50]/70 md:w-2/3 leading-relaxed'>
                    Thank you for dining with Tasty Food! We're dedicated to bringing you the freshest meals and top-quality ingredients. Follow us for updates on our new menu items, seasonal specials, and cooking tips. Your daily dining journey starts here—let's make it unforgettable and delicious!
                </p>
            </div>

            {/* Column 2: Company Links */}
            <div>
                <p className='mb-5 text-xl font-medium text-[#2C3E50]'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-[#2C3E50]/80'>
                    <Link to='/' className='hover:text-[#A37D40] transition-colors'>
                        <li>Home</li>
                    </Link>
                    <Link to='/about' className='hover:text-[#A37D40] transition-colors'>
                        <li>About Us</li>
                    </Link>
                    <Link to='/delivery' className='hover:text-[#A37D40] transition-colors'>
                        <li>Delivery Zones</li>
                    </Link>
                    <Link to='/policy' className='hover:text-[#A37D40] transition-colors'>
                        <li>Privacy & Policy</li>
                    </Link>
                </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
                <p className='mb-5 text-xl font-medium text-[#2C3E50]'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-[#2C3E50]/80'>
                    <li className='hover:text-[#A37D40] transition-colors cursor-default'>
                        <span className='font-semibold'>Phone:</span> +91-9999999999
                    </li>
                    <li className='hover:text-[#A37D40] transition-colors cursor-default'>
                        <span className='font-semibold'>Email:</span> contact.tastyfood@info.com
                    </li>
                    <li className='mt-4'>
                        {/* Placeholder for social media icons */}
                        <div className='flex gap-4 text-2xl text-[#2C3E50]'>
                            <span>{/* Icon Placeholder */}🍴</span>
                            <span>{/* Icon Placeholder */}📸</span>
                            <span>{/* Icon Placeholder */}🐦</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        
        {/* Copyright Section */}
        <div>
            <hr className='border-t border-[#A37D40]/50' />
            <p className='py-5 text-sm text-center text-[#2C3E50]/70'>
                &copy; Copyright {new Date().getFullYear()} Tasty Food. All rights reserved.
            </p>
        </div>
    </div>
  );
}

export default Footer;
