import mongoose from 'mongoose';

const hotelConfigSchema = new mongoose.Schema({
  hotelName: { type: String, required: true, default: 'Royal Heritage Hotel' },
  upiId: { type: String, required: true, default: 'hotelname@upi' },
  upiDisplayName: { type: String, required: true, default: 'Royal Heritage Hotel & Dining' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

const hotelConfigModel = mongoose.models.hotelConfig || mongoose.model('hotelConfig', hotelConfigSchema);

export default hotelConfigModel;
