import mongoose from 'mongoose';

const zoomclassSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const ZoomClass = mongoose.models.ZoomClass || mongoose.model('ZoomClass', zoomclassSchema);

const exportedObj = {
  findOne: async (query) => await ZoomClass.findOne(query),
  find: async (query) => await ZoomClass.find(query),
  create: async (data) => await ZoomClass.create(data),
  model: ZoomClass
};

export const getZoomClassModel = () => exportedObj;

export default exportedObj;
