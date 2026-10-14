import React from 'react'
import { toast } from 'react-toastify'; // Import toast for user feedback

const NewsLetterBox = () => {

    // Premium Color Palette
    const colors = {
      text: 'text-[#2C3E50]', // Deep Charcoal
      accent: 'text-[#A37D40]', // Rich Bronze
      accentBg: 'bg-[#A37D40]',
      accentBorder: 'border-[#A37D40]',
    };

    const onSubmitHandler = (event) => {
        event.preventDefault();
        // Here you would typically send the email to your backend/service
        toast.success("Subscribed! Check your email for your 20% off code.");
        // Optionally clear the form
        event.target.reset();
    }
    
  return (
    // Add a top border for separation from page content
    <div className='mt-20 pt-16 border-t border-[#2C3E50]/10 text-center'>
        
        {/* Title: Use Deep Charcoal and a premium serif font */}
        <p className={`text-3xl font-semibold font-serif ${colors.text}`}>
            Unlock 20% Off | Subscribe Today!
        </p>
        
        {/* Subtitle: Use 70% opacity Deep Charcoal for a softer look */}
        <p className='mt-3 text-[#2C3E50]/70'>
            Don't miss out—unlock your savings now by subscribing below!
        </p>
        
        {/* Form: Use onSubmit, a subtle accent border, and rounded-full */}
        <form 
            onSubmit={onSubmitHandler} 
            className={`flex items-center w-full max-w-lg mx-auto my-8 ${colors.accentBorder}/50 border rounded-full overflow-hidden`}
        >
            <input 
                className='w-full outline-none sm:flex-1 pl-6 py-4 bg-transparent placeholder:text-[#2C3E50]/50' 
                type="email" 
                placeholder='Enter your email address'
                required 
            />
            {/* Button: Use the Rich Bronze CTA color */}
            <button 
                type='submit' 
                className={`px-8 py-4 text-sm font-semibold text-white ${colors.accentBg} transition-all duration-300 hover:bg-[#926F3A]`}
            >
                SUBSCRIBE
            </button>
        </form>
    </div>
  )
}

export default NewsLetterBox
