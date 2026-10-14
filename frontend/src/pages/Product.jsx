import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {

  const {productId} = useParams();
  const {products, currency, addToCart} = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className='pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100 bg-[#FAF7F5] text-[#2C3E50] p-4 sm:p-8'>
      {/* Product Data */}
      <div className='flex flex-col gap-12 sm:gap-12 sm:flex-row'>
        {/* Product Images */}
        <div className='flex flex-col-reverse flex-1 gap-3 sm:flex-row'>
          <div className='flex justify-between overflow-x-auto sm:flex-col sm:overflow-y-scroll sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img 
                  src={item} 
                  key={index}
                  onClick={() => setImage(item)} 
                  className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-lg border transition-all duration-200 ${
                    image === item ? 'border-[#A37D40] py-2 px-2 shadow-md' : 'border-gray-300'
                  }`} 
                  alt={`Menu Item ${index}`} 
                />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%] rounded-xl shadow-lg'>
            <img src={image} className='w-full h-auto rounded-xl' alt={productData.name} />
          </div>
        </div>
        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='mt-2 text-3xl font-serif font-bold text-[#2C3E50]'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2 text-[#A37D40]'>
            {/* Assuming star icons are styled by assets, using text color for visual tone */}
            <img src={assets.star_icon} alt="Ratings" className="w-4" />
            <img src={assets.star_icon} alt="Ratings" className="w-4" />
            <img src={assets.star_icon} alt="Ratings" className="w-4" />
            <img src={assets.star_icon} alt="Ratings" className="w-4" />
            <img src={assets.star_dull_icon} alt="Ratings" className="w-4" />
            <p className='pl-2 text-sm text-gray-500'>(122 Reviews)</p>
          </div>
          <p className='mt-5 text-3xl font-bold text-[#A37D40]'>{currency}{productData.price.toFixed(2)}</p>
          <p className='mt-5 text-[#2C3E50] md:w-4/5 leading-relaxed'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p className='font-semibold'>Select Size / Portion</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 rounded-lg transition duration-200 text-sm font-medium ${
                    item === size 
                      ? 'border-[#A37D40] bg-[#FAF7F5] text-[#A37D40] font-semibold ring-2 ring-[#A37D40]/50' 
                      : 'border-[#2C3E50]/40 bg-white hover:bg-[#FAF7F5]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => addToCart(productData._id, size)} 
            className='px-10 py-3 text-sm font-semibold text-white bg-[#A37D40] rounded-lg shadow-md hover:bg-[#856535] transition duration-200 max-w-xs'
            disabled={!size}
          >
            {size ? `ADD ${size} TO CART` : 'SELECT SIZE TO ORDER'}
          </button>
          <hr className='mt-8 sm:w-4/5 border-t border-[#2C3E50]/20' />
          <div className='flex flex-col gap-1 mt-5 text-sm text-gray-600'>
            <p>Guaranteed Freshness – Crafted Daily!</p>
            <p>Cash on Delivery Available – Pay at Your Doorstep!</p>
            <p>Quality Promise – If you're not satisfied, neither are we!</p>
          </div>
        </div>
      </div>
      {/* Description and Review Section */}
      <div className='mt-20'>
        <div className='flex border-b border-[#2C3E50]/40'>
          <b className='px-5 py-3 text-sm border-t border-r border-l border-[#2C3E50]/40 bg-white shadow-sm text-[#2C3E50]'>Full Recipe Details</b>
          <p className='px-5 py-3 text-sm border-t border-b-0 border-r border-l border-[#2C3E50]/40 text-gray-600 cursor-pointer hover:bg-white/50 transition duration-150'>Customer Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 px-6 py-6 text-sm text-gray-700 border border-[#2C3E50]/40 bg-white/70 rounded-b-lg rounded-tr-lg'>
          <p>Savor the depth of flavor in this dish, prepared with only the freshest, high-quality ingredients. Our chefs follow a time-honored recipe that ensures a perfect balance of spices and textures in every bite. We use organic, locally-sourced produce whenever possible to guarantee superior taste and responsible consumption.</p>
          <p>This meal is designed for effortless enjoyment. Simply heat and serve, or follow our simple finishing instructions to bring out the meal’s true potential. Experience the difference that premium ingredients and expert preparation make—it’s more than a meal, it’s a culinary retreat at your table.</p>
        </div>
      </div>
      {/* Display Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0 bg-[#FAF7F5] min-h-screen'></div>
}

export default Product
