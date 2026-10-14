import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  // Premium Color Palette:
  // Deep Charcoal: #2C3E50
  // Rich Bronze: #A37D40 (CTA/Highlight)

  return (
    <div className='flex flex-col border border-gray-200 sm:flex-row shadow-lg rounded-xl overflow-hidden'>
        {/* Hero left side: Text and CTA */}
        <div className='flex items-center justify-center w-full py-10 sm:w-1/2 sm:py-0 bg-white'>
            <div className='text-[#2C3E50] p-6'>
                <div className='flex items-center gap-2'>
                    {/* Horizontal Line Accent */}
                    <p className='w-8 md:w-11 h-[2px] bg-[#A37D40]'></p> 
                    <p className='text-sm font-bold text-[#A37D40] md:text-base tracking-widest'>TASTY FOOD</p>
                </div>
                {/* Main Heading */}
                <h1 className='text-4xl leading-snug sm:py-3 lg:text-6xl font-serif text-[#2C3E50]'>
                    GOURMET MEALS & FAST DELIVERY
                </h1>
                {/* CTA Line */}
                <div className='flex items-center gap-2 mt-4'>
                    <p className='text-base font-semibold text-[#A37D40] md:text-lg cursor-pointer hover:underline'>ORDER NOW</p>
                    <p className='w-8 md:w-11 h-[1px] bg-[#2C3E50]'></p>
                </div>
            </div>
        </div>
        {/* Hero right side: Image */}
        <img 
            className='w-full sm:w-1/2 h-full object-cover' 
            src={assets.hero_img} 
            alt="Delicious gourmet food arrangement" 
        />
    </div>
  )
}

export default Hero;
