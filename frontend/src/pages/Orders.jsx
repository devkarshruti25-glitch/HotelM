import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
    const { backendUrl, token, currency } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOrderData = async () => {
        try {
            if (!token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch orders.");
            }

            // Orders list in reverse chronological order
            setOrders(response.data.orders || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading order data:", error);
            toast.error(error.message || "Failed to load order history.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrderData();
    }, [token]);

    const getPaymentStatusBadge = (order) => {
        const { paymentMethod, paymentStatus, payment } = order;

        if (paymentMethod === 'UPI_MANUAL') {
            if (paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (!payment && paymentStatus !== 'REJECTED')) {
                return (
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300'>
                        <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
                        UPI – Verification Pending
                    </span>
                );
            }
            if (paymentStatus === 'VERIFIED' || payment) {
                return (
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300'>
                        <span className='w-2 h-2 rounded-full bg-green-600'></span>
                        UPI – Payment Verified
                    </span>
                );
            }
            if (paymentStatus === 'REJECTED') {
                return (
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300'>
                        <span className='w-2 h-2 rounded-full bg-red-600'></span>
                        UPI – Payment Rejected
                    </span>
                );
            }
        }

        if (paymentMethod === 'COD' || paymentMethod === 'cod') {
            if (paymentStatus === 'PAID_ON_DELIVERY' || payment) {
                return (
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300'>
                        <span className='w-2 h-2 rounded-full bg-green-600'></span>
                        COD – Paid on Delivery
                    </span>
                );
            }
            return (
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300'>
                    <span className='w-2 h-2 rounded-full bg-blue-600'></span>
                    Cash on Delivery (Pending)
                </span>
            );
        }

        // Default or other gateway
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                payment ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {paymentMethod || 'Online'} : {payment ? 'Paid' : 'Pending'}
            </span>
        );
    };

    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'PAYMENT_REVIEW':
                return { text: 'Waiting for payment verification', color: 'bg-amber-100 text-amber-900 border-amber-300' };
            case 'PENDING':
                return { text: 'Order Placed', color: 'bg-blue-100 text-blue-900 border-blue-300' };
            case 'CONFIRMED':
                return { text: 'Order Confirmed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
            case 'PREPARING':
                return { text: 'Preparing in Kitchen', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
            case 'READY':
                return { text: 'Food Ready for Pickup', color: 'bg-teal-100 text-teal-900 border-teal-300' };
            case 'OUT FOR DELIVERY':
                return { text: 'Out for Delivery', color: 'bg-purple-100 text-purple-900 border-purple-300' };
            case 'DELIVERED':
                return { text: 'Delivered', color: 'bg-green-100 text-green-900 border-green-300' };
            case 'PAYMENT_FAILED':
                return { text: 'Payment Failed', color: 'bg-red-100 text-red-900 border-red-300' };
            default:
                return { text: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };
        }
    };

    return (
        <div className='pt-14 pb-20 border-t min-h-[80vh] bg-[#FAF7F5] p-4 sm:p-8 lg:p-12 text-[#2C3E50]'>
            <div className='max-w-5xl mx-auto'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4'>
                    <div>
                        <Title text1={'YOUR'} text2={'ORDERS'} />
                        <p className='text-sm text-gray-500 mt-1'>Track your food orders and live verification status.</p>
                    </div>
                    <button
                        onClick={loadOrderData}
                        className='self-start sm:self-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#A37D40] hover:bg-[#856535] rounded-xl shadow transition duration-150 flex items-center gap-2'
                    >
                        <span>🔄</span> Refresh Status
                    </button>
                </div>

                {isLoading ? (
                    <div className='text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm'>
                        <div className='animate-spin h-8 w-8 border-4 border-[#A37D40] border-t-transparent rounded-full mx-auto mb-4'></div>
                        <p className='text-gray-500 font-medium'>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className='text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm'>
                        <div className='text-5xl mb-4'>🍽️</div>
                        <h3 className='text-xl font-bold text-gray-800'>No orders placed yet</h3>
                        <p className='text-gray-500 mt-2 text-sm max-w-sm mx-auto'>
                            Explore our delicious menu and place your favorite food items today!
                        </p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {orders.map((order) => {
                            const statusInfo = getOrderStatusBadge(order.status);
                            const orderDate = new Date(order.date || order.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div
                                    key={order._id}
                                    className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition duration-200 hover:shadow-md'
                                >
                                    {/* Order Card Header */}
                                    <div className='p-5 sm:p-6 bg-[#FAF7F5]/80 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                        <div>
                                            <div className='flex flex-wrap items-center gap-3'>
                                                <span className='text-base font-extrabold text-[#2C3E50]'>
                                                    Order #{order._id.substring(0, 8).toUpperCase()}
                                                </span>
                                                <span className='text-xs text-gray-400 font-mono'>
                                                    ({order._id})
                                                </span>
                                                {getPaymentStatusBadge(order)}
                                            </div>
                                            <p className='text-xs text-gray-500 mt-1.5'>
                                                Placed on: {orderDate}
                                            </p>
                                        </div>

                                        <div className='flex items-center gap-4 self-end md:self-auto'>
                                            <div className='text-right'>
                                                <span className='text-xs text-gray-500 block'>Order Amount</span>
                                                <span className='text-xl font-extrabold text-[#A37D40]'>
                                                    {currency}&nbsp;{Number(order.amount).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specific Notifications & Alerts per Payment Method */}
                                    {order.paymentMethod === 'UPI_MANUAL' && (
                                        <div className='p-4 bg-amber-50/70 border-b border-amber-200/70 text-xs sm:text-sm text-amber-900'>
                                            {order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' && (
                                                <div className='space-y-1.5'>
                                                    <div className='flex items-center gap-2 font-bold text-amber-800'>
                                                        <span className='text-base'>⏳</span>
                                                        <span>Order received. Your payment is pending verification.</span>
                                                    </div>
                                                    <p className='text-amber-800 text-xs pl-6'>
                                                        The hotel will verify your payment and confirm the order shortly.
                                                    </p>
                                                    <p className='text-amber-950 font-semibold text-xs pl-6 mt-1'>
                                                        📌 Please keep your UPI transaction details until your payment has been verified.
                                                    </p>
                                                </div>
                                            )}

                                            {order.paymentStatus === 'VERIFIED' && (
                                                <div className='flex items-center gap-2 font-bold text-green-800'>
                                                    <span className='text-base'>✅</span>
                                                    <span>Payment verified. Your order has been confirmed!</span>
                                                </div>
                                            )}

                                            {order.paymentStatus === 'REJECTED' && (
                                                <div className='space-y-1 text-red-900'>
                                                    <div className='flex items-center gap-2 font-bold text-red-700'>
                                                        <span className='text-base'>❌</span>
                                                        <span>Your payment could not be verified. Please contact the restaurant.</span>
                                                    </div>
                                                    {order.rejection_reason && (
                                                        <p className='text-xs pl-6 text-red-800 font-medium'>
                                                            Reason: {order.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {order.utr && (
                                                <div className='mt-2.5 pt-2 border-t border-amber-200/50 flex flex-wrap items-center gap-2 text-xs'>
                                                    <span className='text-gray-600 font-medium'>Submitted UTR / Transaction ID:</span>
                                                    <span className='font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-amber-200 text-gray-800 tracking-wider'>
                                                        {order.utr}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Order Items List */}
                                    <div className='p-5 sm:p-6 space-y-4'>
                                        <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                                            Ordered Items ({order.items?.length || 0})
                                        </h4>
                                        <div className='divide-y divide-gray-100'>
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className='py-3 flex items-center justify-between text-sm'>
                                                    <div className='flex items-center gap-4'>
                                                        {item.image && item.image[0] ? (
                                                            <img
                                                                src={item.image[0]}
                                                                alt={item.name}
                                                                className='w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100'
                                                            />
                                                        ) : (
                                                            <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl'>
                                                                🍲
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className='font-bold text-[#2C3E50]'>{item.name}</p>
                                                            <div className='flex items-center gap-3 text-xs text-gray-500 mt-0.5'>
                                                                <span>Quantity: <strong className='text-gray-700'>{item.quantity}</strong></span>
                                                                <span>•</span>
                                                                <span>Size: <strong className='text-gray-700'>{item.size}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='text-right'>
                                                        <span className='font-bold text-[#A37D40]'>
                                                            {currency}&nbsp;{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                                        </span>
                                                        <span className='block text-[11px] text-gray-400'>
                                                            ({currency}{Number(item.price).toFixed(2)} each)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Info Footer */}
                                    {order.address && (
                                        <div className='px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2'>
                                            <div>
                                                <span className='font-semibold text-gray-700'>Deliver to: </span>
                                                <span>{order.address.firstName} {order.address.lastName}</span>
                                                <span> — {order.address.street}, {order.address.city}, {order.address.state} ({order.address.zipcode})</span>
                                            </div>
                                            <div className='font-medium text-gray-700'>
                                                📞 {order.address.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
