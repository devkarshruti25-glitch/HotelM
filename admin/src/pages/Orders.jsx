import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Orders = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const premiumStyles = {
        text: "text-[#2C3E50]",
        heading: "text-2xl font-semibold text-[#2C3E50] mb-6",
        card: "bg-white shadow-sm border border-gray-200 rounded-xl p-5 my-4 text-xs sm:text-sm",
        select:
            "w-full px-3 py-2 text-xs font-semibold border border-[#2C3E50]/30 rounded-lg outline-none transition duration-150 focus:border-[#A37D40] focus:ring-1 focus:ring-[#A37D40]"
    };

    const fetchAllOrders = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/order/list',
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error.response?.data?.message || "Failed to fetch orders.");
        } finally {
            setIsLoading(false);
        }
    };

    const statusHandler = async (event, orderId) => {
        try {
            const newStatus = event.target.value;
            const response = await axios.post(
                backendUrl + '/api/order/status',
                { orderId, status: newStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("Order status updated successfully");
                fetchAllOrders();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Something went wrong during status update");
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [token]);

    return (
        <div className={`w-full ${premiumStyles.text}`}>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h3 className={premiumStyles.heading}>All Customer Orders</h3>
                    <p className='text-xs text-gray-500'>
                        Manage kitchen preparation, order delivery status, and customer payments.
                    </p>
                </div>
                <button
                    onClick={fetchAllOrders}
                    className='px-4 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition'
                >
                    🔄 Refresh
                </button>
            </div>

            <div>
                {isLoading ? (
                    <div className='py-20 text-center text-gray-400 bg-white rounded-xl border border-gray-200'>
                        <div className='animate-spin h-6 w-6 border-2 border-[#A37D40] border-t-transparent rounded-full mx-auto mb-2'></div>
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className='py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-200'>
                        No orders placed yet.
                    </div>
                ) : (
                    orders.map((order) => {
                        const isPendingUpi = order.paymentMethod === 'UPI_MANUAL' && (order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (!order.payment && order.paymentStatus !== 'REJECTED'));

                        return (
                            <div
                                key={order._id}
                                className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1.5fr_1fr_1.2fr] gap-4 items-start ${premiumStyles.card} ${
                                    isPendingUpi ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : ''
                                }`}
                            >
                                {/* 1. Icon & ID */}
                                <div className='flex flex-col items-center sm:items-start gap-1'>
                                    <img className="w-10 sm:w-11" src={assets.parcel_icon} alt="Parcel Icon" />
                                    <span className='font-mono text-[10px] text-gray-400 font-bold'>
                                        #{order._id.substring(0, 8).toUpperCase()}
                                    </span>
                                </div>

                                {/* 2. Items & Customer Info */}
                                <div>
                                    <div className="mb-2 max-h-32 overflow-y-auto pr-1">
                                        {order.items.map((item, itemIndex) => (
                                            <p className="py-0.5 font-medium text-xs text-gray-800" key={itemIndex}>
                                                {item.name} <span className="text-gray-500 font-normal">x {item.quantity}</span>{' '}
                                                <span className="text-gray-400 text-[11px]">({item.size})</span>
                                            </p>
                                        ))}
                                    </div>
                                    <p className="font-bold text-sm text-gray-800">
                                        {order.customer_name || (order.address?.firstName + ' ' + order.address?.lastName)}
                                    </p>
                                    <div className="text-gray-500 text-xs mt-0.5">
                                        <p>{order.address?.street}, {order.address?.city}</p>
                                        <p>{order.address?.state} - {order.address?.zipcode}</p>
                                        <p className="text-gray-700 font-semibold mt-0.5">📞 {order.customer_phone || order.address?.phone}</p>
                                    </div>
                                </div>

                                {/* 3. Payment Details & UTR */}
                                <div className='space-y-1.5'>
                                    <p className="text-xs">
                                        <strong className='text-gray-600'>Method: </strong>
                                        <span className='font-semibold'>
                                            {order.paymentMethod === 'UPI_MANUAL' ? 'Online UPI' : order.paymentMethod}
                                        </span>
                                    </p>
                                    <div>
                                        <strong className='text-gray-600 text-xs'>Payment Status: </strong>
                                        {order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (order.paymentMethod === 'UPI_MANUAL' && !order.payment && order.paymentStatus !== 'REJECTED') ? (
                                            <span className='inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300'>
                                                Pending Review
                                            </span>
                                        ) : order.paymentStatus === 'VERIFIED' || order.payment ? (
                                            <span className='inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-300'>
                                                Verified
                                            </span>
                                        ) : order.paymentStatus === 'REJECTED' ? (
                                            <span className='inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300'>
                                                Rejected
                                            </span>
                                        ) : (
                                            <span className='font-semibold text-gray-700'>{order.paymentStatus || 'Pending'}</span>
                                        )}
                                    </div>

                                    {order.utr && (
                                        <div className='text-xs pt-1'>
                                            <span className='text-gray-500 text-[11px] block'>UTR Reference:</span>
                                            <span className='font-mono font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200'>
                                                {order.utr}
                                            </span>
                                        </div>
                                    )}

                                    {isPendingUpi && (
                                        <div className='pt-1'>
                                            <Link
                                                to="/verify-payments"
                                                className='text-[11px] font-bold text-[#A37D40] hover:underline flex items-center gap-1'
                                            >
                                                <span>🔍</span> Go to Payment Verification
                                            </Link>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-gray-400 pt-1">
                                        Date: {new Date(order.date || order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* 4. Amount */}
                                <div>
                                    <p className="text-lg font-black text-[#A37D40]">
                                        {currency(order.amount)}
                                    </p>
                                    <span className='text-[11px] text-gray-400 block'>
                                        Items: {order.items.length}
                                    </span>
                                </div>

                                {/* 5. Order Status Lifecycle Select */}
                                <div className='space-y-1.5'>
                                    <label className='text-[11px] font-bold text-gray-500 block uppercase'>
                                        Order Workflow:
                                    </label>
                                    <select
                                        onChange={(event) => statusHandler(event, order._id)}
                                        value={order.status}
                                        className={premiumStyles.select}
                                    >
                                        <option value="PAYMENT_REVIEW">Waiting Payment (PAYMENT_REVIEW)</option>
                                        <option value="PENDING">Pending (PENDING)</option>
                                        <option value="Order Placed">Order Placed</option>
                                        <option value="CONFIRMED">Confirmed (CONFIRMED)</option>
                                        <option value="PREPARING">Preparing in Kitchen</option>
                                        <option value="Packing">Processing / Packing</option>
                                        <option value="READY">Food Ready</option>
                                        <option value="OUT FOR DELIVERY">Out for delivery</option>
                                        <option value="Out for delivery">Out for delivery (Legacy)</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="PAYMENT_FAILED">Payment Failed (Cancelled)</option>
                                    </select>

                                    {order.rejection_reason && (
                                        <p className='text-[10px] text-red-600 font-semibold'>
                                            Rejection: {order.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Orders;
