import mongoose from 'mongoose';

const emailAgentDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: { type: String, trim: true, lowercase: true, default: '' },
  subject: { type: String, trim: true, maxlength: 150, default: '' },
  body: { type: String, maxlength: 20000, default: '' },
  missingInfo: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['pending', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
  },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

emailAgentDraftSchema.index({ userId: 1, status: 1, createdAt: -1 });

const EmailAgentDraft = mongoose.models.EmailAgentDraft ||
  mongoose.model('EmailAgentDraft', emailAgentDraftSchema);

export default EmailAgentDraft;
