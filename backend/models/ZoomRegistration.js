import mongoose from 'mongoose';

const zoomRegistrationSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  userId: { type: String, required: true },
}, { timestamps: true });

zoomRegistrationSchema.index({ classId: 1, userId: 1 }, { unique: true });

const ZoomRegistration = mongoose.models.ZoomRegistration
  || mongoose.model('ZoomRegistration', zoomRegistrationSchema);

export default {
  model: ZoomRegistration,
};
