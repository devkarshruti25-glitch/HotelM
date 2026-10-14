import mongoose from 'mongoose';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import hotelConfigModel from "../models/hotelConfigModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const currency = 'inr';
const deliveryCharge = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder'
});

// Helper to get or create default Hotel UPI Config
const getOrCreateHotelConfig = async () => {
    let config = await hotelConfigModel.findOne();
    if (!config) {
        config = await hotelConfigModel.create({
            hotelName: "Royal Heritage Hotel",
            upiId: "hotelname@upi",
            upiDisplayName: "Royal Heritage Hotel & Dining",
            updatedBy: "System"
        });
    }
    return config;
};

// Public endpoint to get UPI config for checkout
const getUpiConfig = async (req, res) => {
    try {
        const config = await getOrCreateHotelConfig();
        res.json({
            success: true,
            config: {
                hotelName: config.hotelName,
                upiId: config.upiId,
                upiDisplayName: config.upiDisplayName
            }
        });
    } catch (error) {
        console.error("Error fetching UPI config:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin endpoint to get full UPI config
const getAdminUpiConfig = async (req, res) => {
    try {
        const config = await getOrCreateHotelConfig();
        res.json({ success: true, config });
    } catch (error) {
        console.error("Error fetching admin UPI config:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin endpoint to update UPI config
const updateUpiConfig = async (req, res) => {
    try {
        const { hotelName, upiId, upiDisplayName } = req.body;
        if (!hotelName || !upiId) {
            return res.status(400).json({ success: false, message: "Hotel Name and UPI ID are required" });
        }

        // Basic UPI ID format check (e.g., username@bank)
        const cleanUpiId = upiId.trim();
        if (!cleanUpiId.includes('@') || cleanUpiId.length < 5) {
            return res.status(400).json({ success: false, message: "Please provide a valid UPI ID (e.g. hotel@upi)" });
        }

        let config = await hotelConfigModel.findOne();
        if (config) {
            config.hotelName = hotelName.trim();
            config.upiId = cleanUpiId;
            config.upiDisplayName = (upiDisplayName || hotelName).trim();
            config.updatedAt = new Date();
            config.updatedBy = process.env.ADMIN_EMAIL || "Admin";
            await config.save();
        } else {
            config = await hotelConfigModel.create({
                hotelName: hotelName.trim(),
                upiId: cleanUpiId,
                upiDisplayName: (upiDisplayName || hotelName).trim(),
                updatedBy: process.env.ADMIN_EMAIL || "Admin"
            });
        }

        res.json({ success: true, message: "UPI configuration updated successfully", config });
    } catch (error) {
        console.error("Error updating UPI config:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place Order: Cash on Delivery (COD)
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, subtotal, delivery_charge, tax } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart items are required" });
        }

        const customer_name = address ? `${address.firstName || ''} ${address.lastName || ''}`.trim() : '';
        const customer_phone = address ? (address.phone || '') : '';

        const orderData = {
            userId,
            items,
            address,
            amount: Number(amount),
            subtotal: Number(subtotal || 0),
            delivery_charge: Number(delivery_charge || 10),
            tax: Number(tax || 0),
            customer_name,
            customer_phone,
            paymentMethod: "COD",
            paymentStatus: "COD_PENDING",
            status: "PENDING",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear user cart if valid user
        if (mongoose.Types.ObjectId.isValid(userId)) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        res.json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        console.error("Error placing COD order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place Order: UPI Manual Payment with UTR & Optional Screenshot
const placeOrderUPI = async (req, res) => {
    try {
        let { userId, items, amount, address, utr, subtotal, delivery_charge, tax } = req.body;

        // Support multipart/form-data parsing
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch (e) { items = []; }
        }
        if (typeof address === 'string') {
            try { address = JSON.parse(address); } catch (e) { address = {}; }
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart items are required" });
        }

        // Validate UTR
        if (!utr || typeof utr !== 'string') {
            return res.status(400).json({ success: false, message: "Please provide a valid UTR / Transaction ID" });
        }

        const cleanUtr = utr.trim().toUpperCase();

        // Length validation (UTR is typically 12 digits, allow 6-30 alphanumeric)
        if (cleanUtr.length < 6 || cleanUtr.length > 30) {
            return res.status(400).json({
                success: false,
                message: "Invalid UTR length. UTR / Transaction ID must be between 6 and 30 characters."
            });
        }

        // Prevent obviously invalid characters
        const validUtrRegex = /^[A-Z0-9_-]+$/;
        if (!validUtrRegex.test(cleanUtr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid characters in UTR. Only letters, numbers, and dashes are allowed."
            });
        }

        // Duplicate UTR Protection: Check DB before accepting
        const existingOrder = await orderModel.findOne({ utr: cleanUtr });
        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: "This UTR has already been submitted for another order."
            });
        }

        // Handle optional screenshot upload
        let screenshotUrl = null;
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "image",
                    folder: "upi_receipts"
                });
                screenshotUrl = result.secure_url;
                // Delete local temp file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (uploadError) {
                console.warn("Cloudinary upload failed, using data URI fallback:", uploadError.message);
                try {
                    const fileData = fs.readFileSync(req.file.path);
                    screenshotUrl = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                } catch (readErr) {
                    console.error("Screenshot reading error:", readErr);
                }
            }
        }

        const customer_name = address ? `${address.firstName || ''} ${address.lastName || ''}`.trim() : '';
        const customer_phone = address ? (address.phone || '') : '';

        const orderData = {
            userId,
            items,
            address,
            amount: Number(amount),
            subtotal: Number(subtotal || 0),
            delivery_charge: Number(delivery_charge || 10),
            tax: Number(tax || 0),
            customer_name,
            customer_phone,
            paymentMethod: "UPI_MANUAL",
            paymentStatus: "PAYMENT_VERIFICATION_PENDING",
            status: "PAYMENT_REVIEW",
            payment: false,
            utr: cleanUtr,
            screenshot: screenshotUrl,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear user cart if valid user
        if (mongoose.Types.ObjectId.isValid(userId)) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        res.json({
            success: true,
            message: "Order received. Your payment is pending verification. The hotel will verify your payment and confirm the order shortly.",
            order: newOrder
        });
    } catch (error) {
        console.error("Error placing UPI order:", error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.utr) {
            return res.status(400).json({
                success: false,
                message: "This UTR has already been submitted for another order."
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Verify UPI Payment
const verifyUPIPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.paymentStatus === 'VERIFIED') {
            return res.status(400).json({ success: false, message: "This payment has already been verified" });
        }

        order.paymentStatus = 'VERIFIED';
        order.status = 'CONFIRMED';
        order.payment = true;
        order.verified_at = new Date();
        order.verified_by = process.env.ADMIN_EMAIL || "Admin";

        await order.save();

        res.json({
            success: true,
            message: "Payment verified. Your order has been confirmed.",
            order
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Reject UPI Payment
const rejectUPIPayment = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.paymentStatus = 'REJECTED';
        order.status = 'PAYMENT_FAILED';
        order.payment = false;
        order.rejection_reason = (reason || "Payment verification failed").trim();
        order.rejected_at = new Date();
        order.rejected_by = process.env.ADMIN_EMAIL || "Admin";

        await order.save();

        res.json({
            success: true,
            message: "Payment rejected. Customer order marked as payment failed.",
            order
        });
    } catch (error) {
        console.error("Error rejecting payment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get Dashboard Stats & Metrics
const getAdminStats = async (req, res) => {
    try {
        const all = await orderModel.find({});

        // Today start time (midnight)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartTs = todayStart.getTime();

        let upiPendingCount = 0;
        let upiVerifiedCount = 0;
        let upiRejectedCount = 0;
        let codOrdersCount = 0;
        let todayTotalOrdersCount = 0;
        let todayVerifiedOnlineAmount = 0;
        let todayCodAmount = 0;

        all.forEach(o => {
            const orderTs = o.date || new Date(o.createdAt).getTime();
            const isToday = orderTs >= todayStartTs;

            if (isToday) {
                todayTotalOrdersCount += 1;
            }

            if (o.paymentMethod === 'UPI_MANUAL') {
                if (o.paymentStatus === 'PAYMENT_VERIFICATION_PENDING') {
                    upiPendingCount += 1;
                } else if (o.paymentStatus === 'VERIFIED') {
                    upiVerifiedCount += 1;
                    if (isToday) {
                        todayVerifiedOnlineAmount += (o.amount || 0);
                    }
                } else if (o.paymentStatus === 'REJECTED') {
                    upiRejectedCount += 1;
                }
            } else if (o.paymentMethod === 'COD' || o.paymentMethod === 'cod') {
                codOrdersCount += 1;
                if (isToday) {
                    todayCodAmount += (o.amount || 0);
                }
            } else if (o.payment) {
                if (isToday) {
                    todayVerifiedOnlineAmount += (o.amount || 0);
                }
            }
        });

        res.json({
            success: true,
            stats: {
                totalOrders: all.length,
                upiPendingCount,
                upiVerifiedCount,
                upiRejectedCount,
                codOrdersCount,
                todayTotalOrdersCount,
                todayVerifiedOnlineAmount,
                todayCodAmount
            }
        });
    } catch (error) {
        console.error("Error calculating admin stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place Order Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            paymentStatus: "PENDING",
            status: "PENDING",
            payment: false,
            date: Date.now()
        };
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                paymentStatus: 'VERIFIED',
                status: 'CONFIRMED'
            });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Place Order Razorpay
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            paymentStatus: "PENDING",
            status: "PENDING",
            payment: false,
            date: Date.now()
        };
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        };

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error });
            }
            res.json({ success: true, order });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {
                payment: true,
                paymentStatus: 'VERIFIED',
                status: 'CONFIRMED'
            });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All Orders for Admin
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1, createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Orders
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).sort({ date: -1, createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.status = status;

        // If COD order is delivered, update payment status to PAID_ON_DELIVERY
        if ((order.paymentMethod === 'COD' || order.paymentMethod === 'cod') && status === 'Delivered') {
            order.paymentStatus = 'PAID_ON_DELIVERY';
            order.payment = true;
        }

        await order.save();
        res.json({ success: true, message: 'Status Updated', order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    verifyRazorpay,
    placeOrder,
    placeOrderUPI,
    verifyUPIPayment,
    rejectUPIPayment,
    getUpiConfig,
    getAdminUpiConfig,
    updateUpiConfig,
    getAdminStats,
    verifyStripe,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus
};