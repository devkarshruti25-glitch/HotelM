import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
  return (
    <div className='bg-[#FAF7F5] p-4 sm:p-8'> {/* Applying the premium off-white background */}
      <div className='pt-8 text-2xl text-center border-t border-gray-300'>
        <Title text1={'ABOUT'} text2={'TASTY FOOD'} />
      </div>
      <div className='flex flex-col gap-16 my-10 md:flex-row'>
        <img className='w-full md:max-w-[450px] rounded-lg shadow-xl' src={assets.about_img} alt="A delicious gourmet meal" />
        <div className='flex flex-col justify-center gap-6 text-[#525252] md:w-2/4'> {/* Darker, softer gray for body text */}
          <p>Welcome to TastyFood, where every ingredient tells a story and every meal is a memorable experience. Our mission is to deliver exceptional, high-quality cuisine and fresh ingredients directly to your home. We believe that enjoying gourmet food should be effortless, bringing comfort and joy to your table without the fuss.</p>
          <p>At TastyFood, we are obsessed with freshness and authentic flavor. Our chefs and sourcing team work tirelessly to ensure every dish and product meets the highest culinary standards. From the moment you place your order to the second you take your first bite, we are dedicated to providing a seamless, reliable, and delightful experience. Thank you for choosing us; we are excited to be your guide on this culinary adventure.</p>
          <b className='text-[#2C3E50] text-lg'>Our Flavor Mission</b> {/* Deep Charcoal for emphasis */}
          <p>Our mission is to redefine home dining by consistently delivering gourmet quality, using the freshest ingredients, and offering unforgettable flavors, so you can enjoy incredible meals conveniently.</p>
          <b className='text-[#2C3E50] text-lg'>Our Culinary Vision</b>
          <p>Our vision is to be the most trusted name in premium food delivery and home dining solutions, setting the benchmark for taste, quality, and sustainable, responsible sourcing across the industry.</p>
        </div>
        
      </div>
      <div className='py-4 text-xl mt-12'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>
      <div className='flex flex-col mb-20 text-sm md:flex-row shadow-lg rounded-lg overflow-hidden'>
        <div className='flex flex-col gap-5 px-8 py-10 border-r border-gray-200 bg-white md:w-1/3'>
          <b className='text-[#A37D40] text-base'>Unmatched Freshness</b> {/* Rich Bronze for header highlight */}
          <p className='text-gray-600'>We guarantee the freshness of every item. We utilize locally sourced, seasonal ingredients and implement rigorous quality checks to ensure the food you receive is vibrant, safe, and truly delicious.</p>
        </div>
        <div className='flex flex-col gap-5 px-8 py-10 border-r border-gray-200 bg-white md:w-1/3'>
          <b className='text-[#A37D40] text-base'>Speedy and Secure Delivery</b>
          <p className='text-gray-600'>TasteTrail ensures a smooth, worry-free ordering process with accurate order tracking, flexible scheduling, and prompt delivery right to your doorstep, keeping your food in perfect condition.</p>
        </div>
        <div className='flex flex-col gap-5 px-8 py-10 bg-white md:w-1/3'>
          <b className='text-[#A37D40] text-base'>Gourmet Customer Support</b>
          <p className='text-gray-600'>Our dedicated support team is passionate about food and ready to assist you. Whether you have questions about ingredients, dietary needs, or your order status, we ensure a delightful service experience.</p>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  )
}

export default About