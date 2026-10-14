import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    subtotal: { type: Number, default: 0 },
    delivery_charge: { type: Number, default: 10 },
    tax: { type: Number, default: 0 },
    address: { type: Object, required: true },
    customer_name: { type: String, default: '' },
    customer_phone: { type: String, default: '' },
    status: {
        type: String,
        required: true,
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'UPI_MANUAL', 'Stripe', 'Razorpay', 'cod', 'stripe', 'razorpay']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: [
            'PENDING',
            'COD_PENDING',
            'PAYMENT_VERIFICATION_PENDING',
            'VERIFIED',
            'REJECTED',
            'PAID_ON_DELIVERY',
            'REFUNDED'
        ],
        default: 'PENDING'
    },
    payment: { type: Boolean, required: true, default: false },
    utr: {
        type: String,
        trim: true,
        uppercase: true
    },
    screenshot: { type: String, default: null },
    verified_at: { type: Date, default: null },
    verified_by: { type: String, default: null },
    rejection_reason: { type: String, default: null },
    rejected_at: { type: Date, default: null },
    rejected_by: { type: String, default: null },
    date: { type: Number, required: true }
}, { timestamps: true });

// Sparse unique index on UTR to enforce duplicate protection while allowing null/missing UTRs for COD
orderSchema.index({ utr: 1 }, { unique: true, sparse: true });

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;
