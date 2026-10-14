import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
// Assuming 'assets' and 'CartTotal' are defined elsewhere
import { assets } from '../assets/assets'; 
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    // Only proceed if products list is ready
    if (products.length > 0) {
      const tempData = [];
      // Iterates through products and sizes in cartItems
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        // CRITICAL: Only include items with quantity greater than 0
        if (cartItems[productId][size] > 0) {
          tempData.push({
            _id: productId,
            size: size,
            quantity: cartItems[productId][size],
          });
        }
      }
    }
    setCartData(tempData);
    }
  }, [cartItems, products]); // Rerun whenever cartItems or products change

  const isCartEmpty = cartData.length === 0;

  return (
    <div className='bg-[#FAF7F5] p-4 sm:p-8 pt-14 border-t border-gray-300 min-h-screen'>
      <div className='mb-3 text-2xl text-[#2C3E50]'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {isCartEmpty ? (
        // Show empty message if cartData is empty
        <div className="text-center py-20 text-xl font-medium text-gray-600">
          Your cart is currently empty. Time to order some gourmet food!
          <button
            onClick={() => navigate('/')}
            className="block mx-auto mt-6 px-6 py-2 text-sm text-white bg-[#5A7D37] hover:bg-[#4a672e] rounded-lg transition duration-200"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        // Render cart items
        <div>
          {cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);

            // Safety check in case product data hasn't loaded or was removed
            if (!productData) return null; 

            return (
              <div key={`${item._id}-${item.size}`} className='grid py-4 text-[#2C3E50] border-t border-b border-gray-200 grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20 rounded-lg shadow-md' src={productData.image[0]} alt={productData.name} />
                  <div>
                    <p className='text-sm font-medium sm:text-lg'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p className='font-semibold text-[#A37D40]'> {/* Highlight price in bronze */}
                        {currency}&nbsp;{productData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className='px-2 border rounded-full text-xs sm:px-3 sm:py-1 bg-gray-100 text-gray-600'>{item.size}</p>
                  </div>
                  </div>
                </div>
                {/* Quantity Input: Use 'value' for controlled component */}
                <input
                  onChange={(e) => {
                    const newQuantity = Number(e.target.value);
                    // Update only if it's a valid number (e.g., 1 or greater)
                    if (newQuantity >= 1) { 
                        updateQuantity(item._id, item.size, newQuantity);
                    } else if (e.target.value === '') {
                        updateQuantity(item._id, item.size, 1); 
                    } else if (newQuantity === 0) {
                        // User explicitly set to 0, which triggers removal
                        updateQuantity(item._id, item.size, 0); 
                    }
                  }} 
                  className='px-1 py-1 border border-gray-300 rounded-lg max-w-10 sm:max-w-20 sm:px-2 text-center focus:border-[#A37D40]' 
                  type="number" 
                  min={0} 
                  value={item.quantity} // Use value instead of defaultValue
                />
                {/* Remove Icon: Sets quantity to 0 */}
                <img 
                  onClick={() => updateQuantity(item._id, item.size, 0)} 
                  className='w-5 mr-4 cursor-pointer sm:w-6 opacity-70 hover:opacity-100 transition duration-150' 
                  src={assets.bin_icon} 
                  alt="Remove" 
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Totals and Checkout Button */}
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          {!isCartEmpty && <CartTotal />} {/* Show CartTotal only if items exist */}
          <div className='w-full text-end'>
            <button 
              onClick={() => navigate('/place-order')} 
              className={`px-8 py-3 my-8 text-sm font-semibold text-white bg-[#A37D40] rounded-lg transition duration-300 hover:bg-[#856535] ${isCartEmpty ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isCartEmpty}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
