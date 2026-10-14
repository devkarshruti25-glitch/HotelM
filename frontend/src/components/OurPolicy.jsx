import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {

    // Premium Color Palette
    const colors = {
      text: 'text-[#2C3E50]', // Deep Charcoal
      subtleText: 'text-[#2C3E50]/70', // Lighter Charcoal
      border: 'border-[#2C3E50]/10',
      background: 'bg-[#FAF7F5]' // Creamy Off-White (applied to page)
    };

  return (
    // Framed container for a premium feel
    <div className={`flex flex-col justify-around gap-12 py-16 text-center ${colors.text} sm:flex-row sm:gap-6 border-y ${colors.border}`}>
        
        {/* Policy 1: Freshness Guarantee */}
        <div className='flex flex-col items-center p-4'>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-4' alt="Freshness Guarantee" />
            <p className='mb-2 text-base font-semibold md:text-lg'>Freshness Guarantee</p>
            <p className={`text-sm ${colors.subtleText}`}>
                We promise your food arrives fresh, or we'll make it right.
            </p>
        </div>

        {/* Policy 2: Quality Ingredients */}
        <div className='flex flex-col items-center p-4'>
            <img src={assets.quality_icon} className='w-12 m-auto mb-4' alt="Quality Ingredients" />
            <p className='mb-2 text-base font-semibold md:text-lg'>Premium Quality</p>
            <p className={`text-sm ${colors.subtleText}`}>
                Tasty Food ensures top-quality, chef-selected ingredients.
            </p>
        </div>
        
        {/* Policy 3: Customer Support */}
        <div className='flex flex-col items-center p-4'>
            <img src={assets.support_img} className='w-12 m-auto mb-4' alt="Customer Support" />
            <p className='mb-2 text-base font-semibold md:text-lg'>Gourmet Support</p>
            <p className={`text-sm ${colors.subtleText}`}>
                We're here to help via email, phone, or live chat.
            </p>
        </div>

    </div>
  )
}

export default OurPolicy
