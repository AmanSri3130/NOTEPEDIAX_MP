import mongoose from 'mongoose';

const upitransactionSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const UpiTransaction = mongoose.models.UpiTransaction || mongoose.model('UpiTransaction', upitransactionSchema);

const exportedObj = {
  findOne: async (query) => await UpiTransaction.findOne(query),
  find: async (query) => await UpiTransaction.find(query),
  create: async (data) => await UpiTransaction.create(data),
  model: UpiTransaction
};

export const getUpiTransactionModel = () => exportedObj;

export default exportedObj;
