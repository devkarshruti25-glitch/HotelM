import express from 'express';
import {
    placeOrder,
    placeOrderUPI,
    verifyUPIPayment,
    rejectUPIPayment,
    getUpiConfig,
    getAdminUpiConfig,
    updateUpiConfig,
    getAdminStats,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    verifyStripe,
    verifyRazorpay
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const orderRouter = express.Router();

// Public routes
orderRouter.get('/upi-config', getUpiConfig);

// Admin Routes
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/verify-upi', adminAuth, verifyUPIPayment);
orderRouter.post('/reject-upi', adminAuth, rejectUPIPayment);
orderRouter.get('/admin/stats', adminAuth, getAdminStats);
orderRouter.get('/admin/upi-config', adminAuth, getAdminUpiConfig);
orderRouter.post('/admin/upi-config', adminAuth, updateUpiConfig);

// Customer Routes
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/place-upi', upload.single('screenshot'), authUser, placeOrderUPI);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verifystripe', authUser, verifyStripe);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay);

export default orderRouter;