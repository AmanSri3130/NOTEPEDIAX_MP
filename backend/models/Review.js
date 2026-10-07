import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

const exportedObj = {
  findOne: async (query) => await Review.findOne(query),
  find: async (query) => await Review.find(query),
  create: async (data) => await Review.create(data),
  model: Review
};

export const getReviewModel = () => exportedObj;

export default exportedObj;
