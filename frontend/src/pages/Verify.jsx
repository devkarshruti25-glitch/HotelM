import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {
    const {navigate,token,setCartItems,backendUrl} = useContext(ShopContext)
    const [searchParams]=useSearchParams()

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async ()=>{
        try {
            if (!token) {
                // If token is missing, wait for the main App logic to provide it.
                return
            }

            const response = await axios.post(backendUrl+'/api/order/verifyStripe',{success,orderId},{headers:{token}})
            
            if (response.data.success) {
                toast.success("Payment verified successfully!");
                // Clear cart and navigate to orders page
                setCartItems({})
                navigate('/orders')
            }else{
                toast.error("Payment verification failed. Redirecting to cart.");
                // Navigate back to cart on failure
                navigate('/cart')
            }
        } catch (error) {
            console.error("Verification Error:", error)
            toast.error("An unexpected error occurred. Please check your order history.");
            navigate('/cart');
        }
    }
        
    useEffect(()=>{
     verifyPayment()
    },[token])
    
  return (
      <div className='min-h-[60vh] flex items-center justify-center bg-[#FAF7F5] text-[#2C3E50]'>
          <div className="flex flex-col items-center justify-center gap-4 p-8 border border-[#A37D40]/50 rounded-lg shadow-xl bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#A37D40]"></div>
              <p className="text-xl font-semibold text-[#2C3E50]">Processing Payment Verification...</p>
              <p className="text-sm text-gray-600">Please wait, do not close this window.</p>
          </div>
      </div>
  )
}

export default Verify
