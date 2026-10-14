import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const PaymentVerification = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        upiPendingCount: 0,
        upiVerifiedCount: 0,
        upiRejectedCount: 0,
        codOrdersCount: 0,
        todayTotalOrdersCount: 0,
        todayVerifiedOnlineAmount: 0,
        todayCodAmount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [activeFilter, setActiveFilter] = useState('UPI_PENDING'); // 'ALL', 'UPI_PENDING', 'UPI_VERIFIED', 'UPI_REJECTED', 'COD'
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Modal state for verifying payment
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Rejection state
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('Payment not received');
    const [customReason, setCustomReason] = useState('');

    // Screenshot Zoom Modal
    const [zoomedScreenshot, setZoomedScreenshot] = useState(null);

    // Fetch all orders and stats
    const fetchData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [ordersRes, statsRes] = await Promise.all([
                axios.post(backendUrl + '/api/order/list', {}, { headers: { token } }),
                axios.get(backendUrl + '/api/order/admin/stats', { headers: { token } })
            ]);

            if (ordersRes.data.success) {
                setOrders(ordersRes.data.orders);
            }
            if (statsRes.data.success && statsRes.data.stats) {
                setStats(statsRes.data.stats);
            }
        } catch (error) {
            console.error("Error fetching admin payment data:", error);
            toast.error(error.response?.data?.message || "Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Handle Confirm Payment
    const handleConfirmPayment = async (orderId) => {
        setIsProcessing(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/order/verify-upi',
                { orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Payment verified! Order confirmed.");
                setSelectedOrder(null);
                fetchData();
            } else {
                toast.error(response.data.message || "Failed to verify payment");
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error(error.response?.data?.message || "Failed to verify payment");
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle Reject Payment
    const handleRejectPayment = async (orderId) => {
        const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;
        if (!finalReason || finalReason.trim() === '') {
            toast.error("Please provide a rejection reason");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/order/reject-upi',
                { orderId, reason: finalReason },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.info("Payment rejected. Order marked as PAYMENT_FAILED.");
                setSelectedOrder(null);
                setShowRejectForm(false);
                setCustomReason('');
                fetchData();
            } else {
                toast.error(response.data.message || "Failed to reject payment");
            }
        } catch (error) {
            console.error("Error rejecting payment:", error);
            toast.error(error.response?.data?.message || "Failed to reject payment");
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter orders based on tabs, search query, date
    const filteredOrders = orders.filter((order) => {
        // Tab Filter
        if (activeFilter === 'UPI_PENDING') {
            if (!(order.paymentMethod === 'UPI_MANUAL' && (order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (!order.payment && order.paymentStatus !== 'REJECTED')))) {
                return false;
            }
        } else if (activeFilter === 'UPI_VERIFIED') {
            if (!(order.paymentMethod === 'UPI_MANUAL' && (order.paymentStatus === 'VERIFIED' || order.payment))) {
                return false;
            }
        } else if (activeFilter === 'UPI_REJECTED') {
            if (!(order.paymentMethod === 'UPI_MANUAL' && order.paymentStatus === 'REJECTED')) {
                return false;
            }
        } else if (activeFilter === 'COD') {
            if (!(order.paymentMethod === 'COD' || order.paymentMethod === 'cod')) {
                return false;
            }
        }

        // Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const orderId = (order._id || '').toLowerCase();
            const utr = (order.utr || '').toLowerCase();
            const name = (order.customer_name || (order.address?.firstName + ' ' + order.address?.lastName) || '').toLowerCase();
            const phone = (order.customer_phone || order.address?.phone || '').toLowerCase();

            if (!orderId.includes(q) && !utr.includes(q) && !name.includes(q) && !phone.includes(q)) {
                return false;
            }
        }

        // Date Filter (YYYY-MM-DD)
        if (dateFilter) {
            const orderDateStr = new Date(order.date || order.createdAt).toISOString().split('T')[0];
            if (orderDateStr !== dateFilter) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className='w-full space-y-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h2 className='text-2xl font-extrabold text-[#2C3E50]'>Payment Verification</h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        Review customer submitted UTRs, verify hotel bank transactions, and approve or reject orders.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className='self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition'
                >
                    🔄 Refresh Orders
                </button>
            </div>

            {/* Dashboard Summary Cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4'>
                {/* UPI Pending */}
                <div
                    onClick={() => setActiveFilter('UPI_PENDING')}
                    className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                        activeFilter === 'UPI_PENDING'
                            ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400'
                            : 'bg-white hover:bg-amber-50/50 border-gray-200'
                    }`}
                >
                    <span className={`text-xs font-semibold uppercase block ${activeFilter === 'UPI_PENDING' ? 'text-amber-100' : 'text-amber-600'}`}>
                        UPI Pending
                    </span>
                    <span className='text-2xl font-black mt-1 block'>{stats.upiPendingCount}</span>
                    <span className={`text-[11px] block mt-1 ${activeFilter === 'UPI_PENDING' ? 'text-amber-100' : 'text-gray-400'}`}>
                        Requires review
                    </span>
                </div>

                {/* UPI Verified */}
                <div
                    onClick={() => setActiveFilter('UPI_VERIFIED')}
                    className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                        activeFilter === 'UPI_VERIFIED'
                            ? 'bg-green-600 text-white border-green-700 ring-2 ring-green-400'
                            : 'bg-white hover:bg-green-50/50 border-gray-200'
                    }`}
                >
                    <span className={`text-xs font-semibold uppercase block ${activeFilter === 'UPI_VERIFIED' ? 'text-green-100' : 'text-green-600'}`}>
                        UPI Verified
                    </span>
                    <span className='text-2xl font-black mt-1 block'>{stats.upiVerifiedCount}</span>
                    <span className={`text-[11px] block mt-1 ${activeFilter === 'UPI_VERIFIED' ? 'text-green-100' : 'text-gray-400'}`}>
                        Confirmed
                    </span>
                </div>

                {/* UPI Rejected */}
                <div
                    onClick={() => setActiveFilter('UPI_REJECTED')}
                    className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                        activeFilter === 'UPI_REJECTED'
                            ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-400'
                            : 'bg-white hover:bg-red-50/50 border-gray-200'
                    }`}
                >
                    <span className={`text-xs font-semibold uppercase block ${activeFilter === 'UPI_REJECTED' ? 'text-red-100' : 'text-red-600'}`}>
                        UPI Rejected
                    </span>
                    <span className='text-2xl font-black mt-1 block'>{stats.upiRejectedCount}</span>
                    <span className={`text-[11px] block mt-1 ${activeFilter === 'UPI_REJECTED' ? 'text-red-100' : 'text-gray-400'}`}>
                        Failed / Mismatch
                    </span>
                </div>

                {/* COD Orders */}
                <div
                    onClick={() => setActiveFilter('COD')}
                    className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                        activeFilter === 'COD'
                            ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400'
                            : 'bg-white hover:bg-blue-50/50 border-gray-200'
                    }`}
                >
                    <span className={`text-xs font-semibold uppercase block ${activeFilter === 'COD' ? 'text-blue-100' : 'text-blue-600'}`}>
                        COD Orders
                    </span>
                    <span className='text-2xl font-black mt-1 block'>{stats.codOrdersCount}</span>
                    <span className={`text-[11px] block mt-1 ${activeFilter === 'COD' ? 'text-blue-100' : 'text-gray-400'}`}>
                        Cash on delivery
                    </span>
                </div>

                {/* Today's Total Orders */}
                <div className='p-4 rounded-xl border bg-white border-gray-200 shadow-sm'>
                    <span className='text-xs font-semibold text-gray-500 uppercase block'>Today's Orders</span>
                    <span className='text-2xl font-black text-gray-800 mt-1 block'>{stats.todayTotalOrdersCount}</span>
                    <span className='text-[11px] text-gray-400 block mt-1'>Today's volume</span>
                </div>

                {/* Today's Verified Online Revenue */}
                <div className='p-4 rounded-xl border bg-white border-gray-200 shadow-sm'>
                    <span className='text-xs font-semibold text-emerald-600 uppercase block'>Today's Online</span>
                    <span className='text-xl sm:text-2xl font-black text-emerald-700 mt-1 block'>
                        ₹{stats.todayVerifiedOnlineAmount.toLocaleString('en-IN')}
                    </span>
                    <span className='text-[11px] text-gray-400 block mt-1'>Verified UPI</span>
                </div>

                {/* Today's COD Revenue */}
                <div className='p-4 rounded-xl border bg-white border-gray-200 shadow-sm'>
                    <span className='text-xs font-semibold text-blue-600 uppercase block'>Today's COD</span>
                    <span className='text-xl sm:text-2xl font-black text-blue-700 mt-1 block'>
                        ₹{stats.todayCodAmount.toLocaleString('en-IN')}
                    </span>
                    <span className='text-[11px] text-gray-400 block mt-1'>Collect on delivery</span>
                </div>
            </div>

            {/* Filter Tabs & Search Controls */}
            <div className='bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    {/* Tabs */}
                    <div className='flex flex-wrap gap-2'>
                        {[
                            { key: 'UPI_PENDING', label: '⏳ UPI Pending Review', count: stats.upiPendingCount },
                            { key: 'ALL', label: 'All Orders', count: stats.totalOrders },
                            { key: 'UPI_VERIFIED', label: '✓ Verified UPI', count: stats.upiVerifiedCount },
                            { key: 'UPI_REJECTED', label: '✕ Rejected UPI', count: stats.upiRejectedCount },
                            { key: 'COD', label: '💵 COD Orders', count: stats.codOrdersCount }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                    activeFilter === tab.key
                                        ? 'bg-[#A37D40] text-white shadow-sm'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Date Filter */}
                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search Order ID, UTR, Name...'
                            className='px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A37D40] w-full sm:w-60'
                        />
                        <input
                            type='date'
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className='px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A37D40] text-gray-700'
                            title='Filter by Date'
                        />
                        {(searchQuery || dateFilter) && (
                            <button
                                onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                                className='text-xs text-red-600 hover:underline whitespace-nowrap'
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left text-xs border-collapse'>
                        <thead className='bg-[#FAF7F5] border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]'>
                            <tr>
                                <th className='p-4'>Order ID</th>
                                <th className='p-4'>Customer Name</th>
                                <th className='p-4'>Phone</th>
                                <th className='p-4'>Amount</th>
                                <th className='p-4'>UTR / Ref ID</th>
                                <th className='p-4'>Payment Method</th>
                                <th className='p-4'>Payment Status</th>
                                <th className='p-4'>Date & Time</th>
                                <th className='p-4'>Order Status</th>
                                <th className='p-4 text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className='p-12 text-center text-gray-400'>
                                        <div className='animate-spin h-6 w-6 border-2 border-[#A37D40] border-t-transparent rounded-full mx-auto mb-2'></div>
                                        Loading order payments...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className='p-12 text-center text-gray-400'>
                                        No orders found matching the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const isPendingUpi = order.paymentMethod === 'UPI_MANUAL' && (order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (!order.payment && order.paymentStatus !== 'REJECTED'));
                                    const customerName = order.customer_name || (order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : 'Guest');
                                    const customerPhone = order.customer_phone || order.address?.phone || 'N/A';
                                    const orderDate = new Date(order.date || order.createdAt).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr
                                            key={order._id}
                                            className={`hover:bg-gray-50/80 transition ${
                                                isPendingUpi ? 'bg-amber-50/30' : ''
                                            }`}
                                        >
                                            {/* Order ID */}
                                            <td className='p-4 font-mono font-semibold text-gray-800'>
                                                #{order._id.substring(0, 8).toUpperCase()}
                                            </td>

                                            {/* Customer Name */}
                                            <td className='p-4 font-semibold text-gray-800'>
                                                {customerName}
                                            </td>

                                            {/* Phone */}
                                            <td className='p-4 text-gray-600 font-mono'>
                                                {customerPhone}
                                            </td>

                                            {/* Amount */}
                                            <td className='p-4 font-bold text-[#A37D40] text-sm'>
                                                ₹{Number(order.amount).toFixed(2)}
                                            </td>

                                            {/* UTR */}
                                            <td className='p-4'>
                                                {order.utr ? (
                                                    <div className='flex items-center gap-1.5'>
                                                        <span className='font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 tracking-wider'>
                                                            {order.utr}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(order.utr);
                                                                toast.success("UTR copied!");
                                                            }}
                                                            title='Copy UTR'
                                                            className='text-gray-400 hover:text-gray-600'
                                                        >
                                                            📋
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className='text-gray-400 italic'>None</span>
                                                )}
                                            </td>

                                            {/* Payment Method */}
                                            <td className='p-4'>
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                    order.paymentMethod === 'UPI_MANUAL'
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                        : order.paymentMethod === 'COD' || order.paymentMethod === 'cod'
                                                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.paymentMethod === 'UPI_MANUAL' ? 'Online UPI' : order.paymentMethod}
                                                </span>
                                            </td>

                                            {/* Payment Status */}
                                            <td className='p-4'>
                                                {order.paymentStatus === 'PAYMENT_VERIFICATION_PENDING' || (order.paymentMethod === 'UPI_MANUAL' && !order.payment && order.paymentStatus !== 'REJECTED') ? (
                                                    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                                                        Pending Review
                                                    </span>
                                                ) : order.paymentStatus === 'VERIFIED' || order.payment ? (
                                                    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-green-800 border border-green-300'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-green-600'></span>
                                                        Verified
                                                    </span>
                                                ) : order.paymentStatus === 'REJECTED' ? (
                                                    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-300'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-red-600'></span>
                                                        Rejected
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-600'>{order.paymentStatus || 'Pending'}</span>
                                                )}
                                            </td>

                                            {/* Date/Time */}
                                            <td className='p-4 text-gray-500 text-[11px] whitespace-nowrap'>
                                                {orderDate}
                                            </td>

                                            {/* Order Status */}
                                            <td className='p-4'>
                                                <span className='font-semibold text-gray-700'>
                                                    {order.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className='p-4 text-center'>
                                                {order.paymentMethod === 'UPI_MANUAL' ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowRejectForm(false);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-1 mx-auto ${
                                                            isPendingUpi
                                                                ? 'bg-[#A37D40] hover:bg-[#856535] text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        <span>🔍</span>
                                                        <span>{isPendingUpi ? 'Verify Payment' : 'View Details'}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className='px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs'
                                                    >
                                                        Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CONFIRMATION / VERIFICATION MODAL */}
            {selectedOrder && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 text-[#2C3E50]'>
                        {/* Modal Header */}
                        <div className='p-5 border-b border-gray-200 flex items-center justify-between bg-[#FAF7F5]'>
                            <div>
                                <h3 className='text-lg font-extrabold text-[#2C3E50]'>
                                    Payment Verification Details
                                </h3>
                                <p className='text-xs text-gray-500 font-mono'>
                                    Order ID: #{selectedOrder._id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className='text-gray-400 hover:text-gray-600 text-xl font-bold p-1'
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className='p-6 space-y-5 text-sm'>
                            {/* Amount & UTR Banner */}
                            <div className='p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4'>
                                <div>
                                    <span className='text-xs text-amber-800 font-medium block'>Exact Order Amount</span>
                                    <span className='text-2xl font-black text-[#A37D40]'>
                                        ₹{Number(selectedOrder.amount).toFixed(2)}
                                    </span>
                                </div>
                                <div className='bg-white p-2.5 rounded-lg border border-amber-300 text-center sm:text-right w-full sm:w-auto'>
                                    <span className='text-[10px] text-gray-500 uppercase font-bold block'>Customer Submitted UTR</span>
                                    <div className='flex items-center justify-center sm:justify-end gap-2 mt-0.5'>
                                        <span className='font-mono font-extrabold text-base text-gray-900 tracking-wider'>
                                            {selectedOrder.utr || 'No UTR provided'}
                                        </span>
                                        {selectedOrder.utr && (
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedOrder.utr);
                                                    toast.success("UTR copied to clipboard!");
                                                }}
                                                className='text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold'
                                            >
                                                Copy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                                <h4 className='font-bold text-xs uppercase tracking-wider text-gray-500 mb-2'>
                                    Customer Information
                                </h4>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
                                    <p>
                                        <strong className='text-gray-700'>Name: </strong>
                                        {selectedOrder.customer_name || `${selectedOrder.address?.firstName || ''} ${selectedOrder.address?.lastName || ''}`}
                                    </p>
                                    <p>
                                        <strong className='text-gray-700'>Phone: </strong>
                                        {selectedOrder.customer_phone || selectedOrder.address?.phone || 'N/A'}
                                    </p>
                                    <p className='sm:col-span-2'>
                                        <strong className='text-gray-700'>Delivery Address: </strong>
                                        {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} ({selectedOrder.address?.zipcode})
                                    </p>
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div>
                                <h4 className='font-bold text-xs uppercase tracking-wider text-gray-500 mb-2'>
                                    Ordered Items ({selectedOrder.items?.length || 0})
                                </h4>
                                <div className='border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-48 overflow-y-auto'>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className='p-2.5 flex items-center justify-between text-xs'>
                                            <div>
                                                <span className='font-bold text-gray-800'>{item.name}</span>
                                                <span className='text-gray-500 ml-2'>x {item.quantity} ({item.size})</span>
                                            </div>
                                            <span className='font-bold text-[#A37D40]'>
                                                ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Payment Screenshot */}
                            {selectedOrder.screenshot && (
                                <div className='p-4 bg-gray-50 border border-gray-200 rounded-xl'>
                                    <h4 className='font-bold text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5'>
                                        <span>📷</span> Customer Payment Screenshot
                                    </h4>
                                    <div className='flex items-center gap-4'>
                                        <img
                                            src={selectedOrder.screenshot}
                                            alt="Customer Payment Screenshot"
                                            onClick={() => setZoomedScreenshot(selectedOrder.screenshot)}
                                            className='h-24 w-auto object-cover rounded-lg border border-gray-300 shadow cursor-zoom-in hover:opacity-90 transition'
                                        />
                                        <div className='text-xs text-gray-500'>
                                            <p className='font-medium text-gray-700'>Uploaded Receipt</p>
                                            <p className='text-[11px]'>Click image to view high-resolution zoom.</p>
                                            <button
                                                type='button'
                                                onClick={() => setZoomedScreenshot(selectedOrder.screenshot)}
                                                className='mt-1 text-xs text-[#A37D40] font-bold hover:underline'
                                            >
                                                🔍 View Full Screen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Form Drawer */}
                            {showRejectForm && (
                                <div className='p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-fadeIn'>
                                    <h4 className='font-bold text-sm text-red-900'>
                                        Select Reason for Payment Rejection:
                                    </h4>
                                    <div className='space-y-1.5 text-xs text-gray-800'>
                                        {[
                                            'Payment not received',
                                            'Incorrect amount',
                                            'Invalid UTR',
                                            'UTR already used',
                                            'Payment screenshot/reference mismatch',
                                            'Other'
                                        ].map((reasonOption) => (
                                            <label key={reasonOption} className='flex items-center gap-2 cursor-pointer'>
                                                <input
                                                    type='radio'
                                                    name='rejectionReason'
                                                    value={reasonOption}
                                                    checked={rejectionReason === reasonOption}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className='text-red-600 focus:ring-red-500'
                                                />
                                                <span>{reasonOption}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {rejectionReason === 'Other' && (
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder='Describe reason for rejection...'
                                            className='w-full p-2.5 text-xs border border-red-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white'
                                            rows={2}
                                        />
                                    )}

                                    <div className='flex gap-2 pt-2'>
                                        <button
                                            type='button'
                                            disabled={isProcessing}
                                            onClick={() => handleRejectPayment(selectedOrder._id)}
                                            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50'
                                        >
                                            {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => setShowRejectForm(false)}
                                            className='px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Verification Metadata if already processed */}
                            {selectedOrder.verified_at && (
                                <div className='p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900'>
                                    ✓ Verified on {new Date(selectedOrder.verified_at).toLocaleString()} by {selectedOrder.verified_by || 'Admin'}
                                </div>
                            )}
                            {selectedOrder.rejected_at && (
                                <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900'>
                                    ✕ Rejected on {new Date(selectedOrder.rejected_at).toLocaleString()} by {selectedOrder.rejected_by || 'Admin'}
                                    <p className='font-semibold mt-0.5'>Reason: {selectedOrder.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className='p-5 border-t border-gray-200 bg-[#FAF7F5] flex flex-wrap items-center justify-between gap-3'>
                            <button
                                type='button'
                                onClick={() => setSelectedOrder(null)}
                                className='px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition'
                            >
                                Close
                            </button>

                            {/* Show Action buttons if payment is pending or can be verified */}
                            {selectedOrder.paymentStatus !== 'VERIFIED' && (
                                <div className='flex items-center gap-3'>
                                    {!showRejectForm && (
                                        <button
                                            type='button'
                                            onClick={() => setShowRejectForm(true)}
                                            className='px-4 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition border border-red-300'
                                        >
                                            Reject Payment
                                        </button>
                                    )}
                                    <button
                                        type='button'
                                        disabled={isProcessing}
                                        onClick={() => handleConfirmPayment(selectedOrder._id)}
                                        className='px-5 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow transition disabled:opacity-50 flex items-center gap-1.5'
                                    >
                                        <span>✓</span>
                                        <span>{isProcessing ? 'Verifying...' : 'Confirm Payment'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SCREENSHOT FULLSCREEN ZOOM MODAL */}
            {zoomedScreenshot && (
                <div
                    onClick={() => setZoomedScreenshot(null)}
                    className='fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out'
                >
                    <div className='relative max-w-3xl max-h-[90vh]' onClick={(e) => e.stopPropagation()}>
                        <img
                            src={zoomedScreenshot}
                            alt="High Resolution Payment Receipt"
                            className='max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl'
                        />
                        <button
                            onClick={() => setZoomedScreenshot(null)}
                            className='absolute -top-3 -right-3 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg'
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentVerification;
