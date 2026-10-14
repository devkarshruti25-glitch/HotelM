import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = ({ taxAmount = 0 }) => {
    const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);
    const subtotal = getCartAmount();
    const grandTotal = subtotal === 0 ? 0 : subtotal + delivery_fee + taxAmount;

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTAL'} />
            </div>
            <div className='flex flex-col gap-2 mt-3 text-sm'>
                <div className='flex justify-between text-gray-700'>
                    <p className='text-base font-medium'>Subtotal</p>
                    <p className='text-base font-medium'>
                        {currency}&nbsp;{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <hr className='border-gray-200' />
                <div className='flex justify-between text-gray-700'>
                    <p className='text-base font-medium'>Delivery Charges</p>
                    <p className='text-base font-medium'>
                        {currency}&nbsp;{delivery_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <hr className='border-gray-200' />
                <div className='flex justify-between text-gray-700'>
                    <div className='flex items-center gap-1.5'>
                        <p className='text-base font-medium'>Taxes & Fees</p>
                        <span className='text-xs text-gray-500'>(GST 5% included/applicable)</span>
                    </div>
                    <p className='text-base font-medium'>
                        {currency}&nbsp;{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <hr className='border-gray-200' />
                <div className='flex justify-between text-[#2C3E50]'>
                    <p className='text-xl font-bold'>Grand Total</p>
                    <p className='text-xl font-bold text-[#A37D40]'>
                        {currency}&nbsp;{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;
