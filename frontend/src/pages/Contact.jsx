import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const Contact = () => {
  return (
    <div className='p-4 sm:p-8 bg-[#FAF7F5] min-h-screen'> {/* Apply premium background color */}
      <div className='pt-10 text-2xl text-center border-t border-gray-300'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>
      <div className='flex flex-col justify-center gap-10 my-10 md:flex-row mb-28'>
        <img 
            className='w-full md:max-w-[480px] rounded-xl shadow-xl' 
            src={assets.contact_img} 
            alt="A clean, appealing arrangement showing contact forms or a restaurant setting" 
        />
        <div className='flex flex-col items-start justify-center gap-6 text-[#2C3E50]'> {/* Text color: Deep Charcoal */}
          
            <p className='text-xl font-bold text-[#A37D40] border-b-2 border-[#A37D40] pb-1'>Get in Touch</p>
          
            <div className='text-gray-600'>
                <p className='text-lg font-semibold text-[#2C3E50]'>TastyFood Headquarters</p>
                <p>123 Culinary Boulevard, Spice District</p>
                <p>Mumbai, Maharashtra, India 400001</p>
            </div>
            
          <div className='text-gray-600'>
                <p className='text-lg font-semibold text-[#2C3E50]'>Order & Support Lines</p>
                <p>Tel: (+91) 99999 99999 (For fastest support)</p>
                <p>Email: support@tastyfood.com</p>
            </div>
            
            <p className='text-xl font-bold text-[#A37D40] border-b-2 border-[#A37D40] pb-1'>Hours of Operation</p>
          <p className='text-gray-600'>
                Delivery & Takeout: Monday - Saturday, 11:00 AM – 10:00 PM <br />
                Customer Service: Daily, 9:00 AM – 6:00 PM
            </p>
            
          <p className='text-xl font-bold text-[#A37D40] border-b-2 border-[#A37D40] pb-1'>Catering & Partnerships</p>
          <p className='text-gray-600'>Planning an event? Need bulk orders or a special menu? Contact our dedicated team to discuss your catering needs or potential business partnerships.</p>
            
          <button className='px-8 py-3 text-sm font-semibold transition-all duration-300 bg-[#A37D40] text-white rounded-lg hover:bg-[#856535] shadow-md'>
                INQUIRE ABOUT CATERING
            </button>
        </div>
        {/* Placeholder for Map/Form if needed later */}
      </div>
      <NewsLetterBox />
    </div>
  )
}

export default Contact
