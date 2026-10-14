import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const PlaceOrder = () => {
    // Payment method state: 'cod' or 'upi' (default)
    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency } = useContext(ShopContext);

    // Form data for delivery
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        phone: ''
    });

    // UPI specific states
    const [upiConfig, setUpiConfig] = useState({
        hotelName: 'Royal Heritage Hotel',
        upiId: 'hotelname@upi',
        upiDisplayName: 'Royal Heritage Hotel & Dining'
    });
    const [utr, setUtr] = useState('');
    const [utrError, setUtrError] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);

    // Confirmation Modal State
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    // Fetch UPI configuration dynamically from backend
    useEffect(() => {
        const fetchUpiConfig = async () => {
            try {
                const response = await axios.get(backendUrl + '/api/order/upi-config');
                if (response.data.success && response.data.config) {
                    setUpiConfig(response.data.config);
                }
            } catch (error) {
                console.error("Failed to load UPI config:", error);
            }
        };
        fetchUpiConfig();
    }, [backendUrl]);

    // Calculate Cart Items List & Total
    const cartList = [];
    for (const items in cartItems) {
        for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
                const itemInfo = products.find(product => product._id === items);
                if (itemInfo) {
                    cartList.push({
                        ...itemInfo,
                        size: item,
                        quantity: cartItems[items][item]
                    });
                }
            }
        }
    }

    const subtotal = getCartAmount();
    const taxAmount = 0; // Tax included or 0
    const totalAmount = subtotal === 0 ? 0 : subtotal + delivery_fee + taxAmount;

    // UPI Deep Link URI
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.upiDisplayName || upiConfig.hotelName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Food Order Payment')}`;

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    const handleCopyUpi = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(upiConfig.upiId);
            setCopiedUpi(true);
            toast.success("UPI ID copied to clipboard!");
            setTimeout(() => setCopiedUpi(false), 2500);
        } else {
            toast.info(`UPI ID: ${upiConfig.upiId}`);
        }
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Screenshot file size should be less than 5MB");
                return;
            }
            setScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveScreenshot = () => {
        setScreenshot(null);
        if (screenshotPreview) {
            URL.revokeObjectURL(screenshotPreview);
            setScreenshotPreview(null);
        }
    };

    const handleUtrChange = (e) => {
        // Sanitize UTR: uppercase and remove spaces
        const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
        setUtr(val);
        if (val.length > 0 && val.length < 6) {
            setUtrError("UTR must be at least 6 characters (usually 12 digits)");
        } else {
            setUtrError("");
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (cartList.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        if (!token) {
            toast.error("Please login to place an order");
            navigate('/login');
            return;
        }

        if (isSubmitting) return; // Prevent double submit

        // If UPI method is selected, validate UTR
        if (method === 'upi') {
            const cleanUtr = utr.trim().toUpperCase();
            if (!cleanUtr) {
                setUtrError("Please enter your 12-digit UPI UTR / Transaction ID after paying");
                toast.error("UTR / Transaction ID is required for UPI payment");
                return;
            }
            if (cleanUtr.length < 6 || cleanUtr.length > 30) {
                setUtrError("UTR must be between 6 and 30 characters");
                toast.error("Invalid UTR length");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                address: formData,
                items: cartList,
                subtotal: subtotal,
                delivery_charge: delivery_fee,
                tax: taxAmount,
                amount: totalAmount
            };

            if (method === 'cod') {
                const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({});
                    setConfirmedOrder({
                        id: response.data.order?._id || 'ORD-' + Date.now().toString().slice(-6),
                        method: 'COD',
                        amount: totalAmount,
                        status: 'PENDING',
                        message: "Order placed successfully! You can pay when your order arrives."
                    });
                } else {
                    toast.error(response.data.message || "Failed to place order");
                }
            } else if (method === 'upi') {
                const cleanUtr = utr.trim().toUpperCase();

                // Build FormData to support optional screenshot upload
                const postForm = new FormData();
                postForm.append('items', JSON.stringify(cartList));
                postForm.append('address', JSON.stringify(formData));
                postForm.append('amount', totalAmount);
                postForm.append('subtotal', subtotal);
                postForm.append('delivery_charge', delivery_fee);
                postForm.append('tax', taxAmount);
                postForm.append('utr', cleanUtr);

                if (screenshot) {
                    postForm.append('screenshot', screenshot);
                }

                const response = await axios.post(backendUrl + '/api/order/place-upi', postForm, {
                    headers: {
                        token,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.success) {
                    setCartItems({});
                    setConfirmedOrder({
                        id: response.data.order?._id || 'ORD-' + Date.now().toString().slice(-6),
                        method: 'UPI_MANUAL',
                        utr: cleanUtr,
                        amount: totalAmount,
                        status: 'PAYMENT_REVIEW',
                        message: "Order received. Your payment is pending verification. The hotel will verify your payment and confirm the order shortly."
                    });
                } else {
                    toast.error(response.data.message || "Failed to submit UPI payment");
                }
            } else if (method === 'stripe') {
                const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
                if (responseStripe.data.success) {
                    window.location.replace(responseStripe.data.session_url);
                } else {
                    toast.error(responseStripe.data.message);
                }
            } else if (method === 'razorpay') {
                const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } });
                if (responseRazorpay.data.success) {
                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                        amount: responseRazorpay.data.order.amount,
                        currency: responseRazorpay.data.order.currency,
                        name: 'Order Payment',
                        description: 'Order Payment',
                        order_id: responseRazorpay.data.order.id,
                        receipt: responseRazorpay.data.order.receipt,
                        handler: async (resp) => {
                            try {
                                const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', resp, { headers: { token } });
                                if (data.success) {
                                    setCartItems({});
                                    navigate('/orders');
                                }
                            } catch (err) {
                                console.error(err);
                                toast.error("Razorpay verification failed");
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    toast.error(responseRazorpay.data.message);
                }
            }
        } catch (error) {
            console.error("Order submission error:", error);
            const errMsg = error.response?.data?.message || error.message || "An error occurred during checkout";
            toast.error(errMsg);
            if (errMsg.toLowerCase().includes("utr")) {
                setUtrError(errMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // If order was successfully confirmed, show the dedicated confirmation screen
    if (confirmedOrder) {
        return (
            <div className='min-h-[80vh] bg-[#FAF7F5] p-4 sm:p-12 flex items-center justify-center'>
                <div className='max-w-xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100 text-[#2C3E50]'>
                    <div className='text-center mb-6'>
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 ${
                            confirmedOrder.method === 'UPI_MANUAL' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {confirmedOrder.method === 'UPI_MANUAL' ? '⏳' : '✓'}
                        </div>
                        <h2 className='text-2xl sm:text-3xl font-bold'>
                            {confirmedOrder.method === 'UPI_MANUAL' ? 'Payment Verification Pending' : 'Order Placed Successfully!'}
                        </h2>
                        <p className='text-gray-600 mt-2 text-sm sm:text-base'>
                            {confirmedOrder.message}
                        </p>
                    </div>

                    <div className='bg-[#FAF7F5] rounded-xl p-5 mb-6 space-y-3 border border-gray-200'>
                        <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>Order Reference ID:</span>
                            <span className='font-mono font-bold'>{confirmedOrder.id}</span>
                        </div>
                        <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>Grand Total:</span>
                            <span className='font-bold text-[#A37D40] text-base'>
                                {currency}&nbsp;{confirmedOrder.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>Payment Method:</span>
                            <span className='font-semibold'>
                                {confirmedOrder.method === 'UPI_MANUAL' ? 'Online UPI (Manual Verification)' : 'Cash on Delivery'}
                            </span>
                        </div>
                        {confirmedOrder.utr && (
                            <div className='flex justify-between items-center text-sm border-t border-gray-200 pt-2'>
                                <span className='text-gray-500'>Submitted UTR:</span>
                                <span className='font-mono font-bold text-gray-800 tracking-wider'>{confirmedOrder.utr}</span>
                            </div>
                        )}
                        <div className='flex justify-between items-center text-sm border-t border-gray-200 pt-2'>
                            <span className='text-gray-500'>Order Status:</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                confirmedOrder.method === 'UPI_MANUAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {confirmedOrder.method === 'UPI_MANUAL' ? 'PAYMENT_REVIEW' : 'PENDING'}
                            </span>
                        </div>
                    </div>

                    {confirmedOrder.method === 'UPI_MANUAL' && (
                        <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-amber-900 flex items-start gap-3'>
                            <span className='text-lg'>⚠️</span>
                            <div>
                                <p className='font-semibold'>Please keep your UPI transaction details handy!</p>
                                <p className='mt-1 text-amber-800'>
                                    The hotel admin will verify your payment against their bank records and confirm your order shortly. You can track live status in your orders page.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                        <button
                            onClick={() => navigate('/orders')}
                            className='flex-1 py-3 px-4 bg-[#A37D40] hover:bg-[#856535] text-white font-semibold rounded-xl text-center shadow transition duration-200'
                        >
                            View Order Tracking
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className='py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-center transition duration-200'
                        >
                            Order More Food
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[85vh] border-t bg-[#FAF7F5] p-4 sm:p-8 lg:p-12 text-[#2C3E50]'>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-8'>
                    <Title text1={'CUSTOMER'} text2={'CHECKOUT'} />
                    <p className='text-sm text-gray-500 mt-1'>Complete your delivery details and choose your preferred payment option.</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                    {/* Left Column: Delivery Information */}
                    <div className='lg:col-span-6 space-y-6'>
                        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
                            <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-[#2C3E50]'>
                                <span className='w-6 h-6 rounded-full bg-[#A37D40] text-white flex items-center justify-center text-xs'>1</span>
                                Delivery Address & Contact
                            </h3>

                            <div className='grid grid-cols-2 gap-3 mb-3'>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='firstName'
                                    value={formData.firstName}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='First Name'
                                />
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='lastName'
                                    value={formData.lastName}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='Last Name'
                                />
                            </div>

                            <div className='mb-3'>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='email'
                                    value={formData.email}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="email"
                                    placeholder='Email Address'
                                />
                            </div>

                            <div className='mb-3'>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='street'
                                    value={formData.street}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='Street Address, Apartment/Suite'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3 mb-3'>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='city'
                                    value={formData.city}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='City'
                                />
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='state'
                                    value={formData.state}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='State'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3 mb-3'>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='zipcode'
                                    value={formData.zipcode}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='Pincode / Zip Code'
                                />
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='country'
                                    value={formData.country}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="text"
                                    placeholder='Country'
                                />
                            </div>

                            <div>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name='phone'
                                    value={formData.phone}
                                    className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                                    type="tel"
                                    placeholder='Mobile Number (for delivery coordination)'
                                />
                            </div>
                        </div>

                        {/* Order Items Preview (Step 1 Cart review) */}
                        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
                            <h3 className='text-lg font-bold mb-3 flex items-center justify-between text-[#2C3E50]'>
                                <span>Cart Summary ({cartList.length} items)</span>
                                <span className='text-xs font-normal text-[#A37D40] cursor-pointer hover:underline' onClick={() => navigate('/cart')}>
                                    Edit Cart
                                </span>
                            </h3>

                            <div className='divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1'>
                                {cartList.map((item, idx) => (
                                    <div key={idx} className='py-2.5 flex items-center justify-between text-xs sm:text-sm'>
                                        <div className='flex items-center gap-3'>
                                            {item.image && item.image[0] && (
                                                <img src={item.image[0]} alt={item.name} className='w-10 h-10 object-cover rounded-md' />
                                            )}
                                            <div>
                                                <p className='font-semibold text-gray-800'>{item.name}</p>
                                                <p className='text-gray-500 text-xs'>Qty: {item.quantity} | Size: {item.size}</p>
                                            </div>
                                        </div>
                                        <p className='font-bold text-[#2C3E50]'>
                                            {currency}&nbsp;{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cart Totals & Payment Method Options */}
                    <div className='lg:col-span-6 space-y-6'>
                        {/* Cart Totals */}
                        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
                            <CartTotal taxAmount={taxAmount} />
                        </div>

                        {/* Step 2 – Payment Methods */}
                        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
                            <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-[#2C3E50]'>
                                <span className='w-6 h-6 rounded-full bg-[#A37D40] text-white flex items-center justify-center text-xs'>2</span>
                                Select Payment Method
                            </h3>

                            <div className='space-y-4'>
                                {/* OPTION 1: Cash on Delivery (COD) */}
                                <div
                                    onClick={() => setMethod('cod')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        method === 'cod'
                                            ? 'border-[#5A7D37] bg-green-50/40 ring-1 ring-[#5A7D37]'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                method === 'cod' ? 'border-[#5A7D37]' : 'border-gray-300'
                                            }`}>
                                                {method === 'cod' && <div className='w-2.5 h-2.5 rounded-full bg-[#5A7D37]'></div>}
                                            </div>
                                            <div>
                                                <h4 className='font-bold text-gray-800 text-base'>Cash on Delivery</h4>
                                                <p className='text-xs text-gray-500'>Pay when your order is delivered.</p>
                                            </div>
                                        </div>
                                        <span className='text-2xl'>💵</span>
                                    </div>
                                    {method === 'cod' && (
                                        <div className='mt-3 pt-3 border-t border-green-200/60 text-xs text-green-800 flex items-center gap-1.5'>
                                            <span>✓</span>
                                            <span>No upfront payment or UTR required. Order will be confirmed immediately.</span>
                                        </div>
                                    )}
                                </div>

                                {/* OPTION 2: Online UPI Payment */}
                                <div
                                    onClick={() => setMethod('upi')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        method === 'upi'
                                            ? 'border-[#A37D40] bg-[#FAF7F5] ring-1 ring-[#A37D40]'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                method === 'upi' ? 'border-[#A37D40]' : 'border-gray-300'
                                            }`}>
                                                {method === 'upi' && <div className='w-2.5 h-2.5 rounded-full bg-[#A37D40]'></div>}
                                            </div>
                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <h4 className='font-bold text-gray-800 text-base'>Pay Online via UPI</h4>
                                                    <span className='bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase'>
                                                        Instant QR
                                                    </span>
                                                </div>
                                                <p className='text-xs text-gray-500'>Pay using Google Pay, PhonePe, Paytm or any UPI app.</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600'>GPay</span>
                                            <span className='text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600'>PhonePe</span>
                                            <span className='text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600'>Paytm</span>
                                        </div>
                                    </div>

                                    {/* EXPANDED UPI SECTION WHEN SELECTED */}
                                    {method === 'upi' && (
                                        <div className='mt-5 pt-5 border-t border-gray-200 space-y-5' onClick={(e) => e.stopPropagation()}>
                                            {/* Step 1: Scan & Pay Instructions */}
                                            <div className='bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm'>
                                                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>Hotel UPI Payment</p>
                                                <h4 className='font-bold text-base text-gray-800'>{upiConfig.upiDisplayName || upiConfig.hotelName}</h4>

                                                {/* Amount Highlight */}
                                                <div className='my-3 inline-block bg-[#FAF7F5] px-6 py-2 rounded-xl border border-[#A37D40]/30'>
                                                    <span className='text-xs text-gray-600 block'>Exact Amount to Pay</span>
                                                    <span className='text-2xl font-black text-[#A37D40]'>
                                                        {currency}&nbsp;{totalAmount.toFixed(2)}
                                                    </span>
                                                </div>

                                                {/* Dynamic QR Code */}
                                                <div className='flex flex-col items-center justify-center my-3'>
                                                    <div className='p-3 bg-white border-2 border-dashed border-[#A37D40]/50 rounded-2xl shadow-sm'>
                                                        <QRCodeSVG
                                                            value={upiDeepLink}
                                                            size={180}
                                                            level="M"
                                                            includeMargin={true}
                                                        />
                                                    </div>
                                                    <p className='text-xs text-gray-500 mt-2 font-medium'>
                                                        Scan with GPay, PhonePe, Paytm, or BHIM
                                                    </p>
                                                </div>

                                                {/* UPI ID & Copy Button */}
                                                <div className='flex items-center justify-center gap-2 max-w-sm mx-auto bg-gray-50 p-2.5 rounded-lg border border-gray-200'>
                                                    <span className='text-xs text-gray-500 font-medium'>UPI ID:</span>
                                                    <span className='text-xs sm:text-sm font-mono font-bold text-gray-800'>{upiConfig.upiId}</span>
                                                    <button
                                                        type='button'
                                                        onClick={handleCopyUpi}
                                                        className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                                                            copiedUpi ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                        }`}
                                                    >
                                                        {copiedUpi ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>

                                                {/* Mobile UPI Deep Link Button */}
                                                <div className='mt-3'>
                                                    <a
                                                        href={upiDeepLink}
                                                        className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-[#A37D40] bg-amber-50 hover:bg-amber-100 rounded-lg border border-[#A37D40]/30 transition'
                                                    >
                                                        <span>📲</span> Pay using Installed UPI App
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Step 2: UTR Submission Input */}
                                            <div className='bg-white p-4 rounded-xl border border-gray-200 space-y-3'>
                                                <label className='block text-xs sm:text-sm font-bold text-gray-800'>
                                                    After completing the payment, enter your UTR / Transaction ID below:
                                                    <span className='text-red-500'>*</span>
                                                </label>
                                                <div className='relative'>
                                                    <input
                                                        type='text'
                                                        required={method === 'upi'}
                                                        value={utr}
                                                        onChange={handleUtrChange}
                                                        maxLength={30}
                                                        placeholder='Enter 12-digit UTR (e.g. 428912345678)'
                                                        className={`w-full px-4 py-3 text-sm font-mono tracking-wider border rounded-lg focus:outline-none focus:ring-2 ${
                                                            utrError
                                                                ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                                                                : 'border-gray-300 focus:ring-[#A37D40]'
                                                        }`}
                                                    />
                                                    <span className='absolute right-3 top-3 text-[11px] text-gray-400 font-mono'>
                                                        {utr.length}/30
                                                    </span>
                                                </div>
                                                {utrError && (
                                                    <p className='text-xs text-red-600 font-medium'>{utrError}</p>
                                                )}
                                                <p className='text-[11px] text-gray-500'>
                                                    The UTR / UPI Transaction Reference is visible in your UPI payment history screen immediately after paying.
                                                </p>
                                            </div>

                                            {/* Step 3: Optional Payment Screenshot */}
                                            <div className='bg-white p-4 rounded-xl border border-gray-200 space-y-2'>
                                                <label className='block text-xs sm:text-sm font-bold text-gray-800'>
                                                    Upload Payment Screenshot <span className='text-gray-400 font-normal'>(Optional)</span>
                                                </label>
                                                <p className='text-[11px] text-gray-500'>
                                                    Uploading a receipt helps the hotel admin verify your order faster.
                                                </p>

                                                {!screenshotPreview ? (
                                                    <label className='flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A37D40] hover:bg-gray-50 transition'>
                                                        <span className='text-2xl mb-1'>📷</span>
                                                        <span className='text-xs font-semibold text-gray-700'>Click to upload payment screenshot</span>
                                                        <span className='text-[10px] text-gray-400'>PNG, JPG or JPEG up to 5MB</span>
                                                        <input
                                                            type='file'
                                                            accept='image/*'
                                                            onChange={handleScreenshotChange}
                                                            className='hidden'
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className='relative inline-block border border-gray-200 rounded-lg p-2 bg-gray-50'>
                                                        <img
                                                            src={screenshotPreview}
                                                            alt="Payment Screenshot Preview"
                                                            className='h-24 w-auto rounded object-cover'
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={handleRemoveScreenshot}
                                                            className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-700'
                                                            title="Remove screenshot"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* UI Disclaimers */}
                                            <div className='bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5'>
                                                <p className='font-bold flex items-center gap-1.5'>
                                                    <span>ℹ️</span> Notice Regarding UPI Verification
                                                </p>
                                                <p className='leading-relaxed'>
                                                    UPI payments are manually verified by the restaurant. Order confirmation will happen after payment verification.
                                                </p>
                                                <p className='leading-relaxed font-medium text-amber-950'>
                                                    Please keep your UPI transaction details until your payment has been verified.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className='mt-8'>
                                <button
                                    type='submit'
                                    disabled={isSubmitting || totalAmount === 0}
                                    className={`w-full py-4 px-6 text-sm sm:text-base font-bold text-white rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 ${
                                        isSubmitting || totalAmount === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#A37D40] hover:bg-[#856535] active:scale-[0.99]'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></span>
                                            <span>Processing Order...</span>
                                        </>
                                    ) : method === 'upi' ? (
                                        <>
                                            <span>Submit Payment & Place Order</span>
                                            <span className='text-sm opacity-90'>({currency}&nbsp;{totalAmount.toFixed(2)})</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Place Order (Cash on Delivery)</span>
                                            <span className='text-sm opacity-90'>({currency}&nbsp;{totalAmount.toFixed(2)})</span>
                                        </>
                                    )}
                                </button>
                                <p className='text-center text-[11px] text-gray-500 mt-2'>
                                    By placing your order, you agree to our terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
