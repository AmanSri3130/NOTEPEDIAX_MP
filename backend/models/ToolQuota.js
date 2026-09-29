import mongoose from 'mongoose';
import { getSharedConnection } from '../config/db.js';

const toolQuotaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toolId: {
      type: String,
      required: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

toolQuotaSchema.index({ userId: 1, toolId: 1, dateString: 1 }, { unique: true });

export const getToolQuotaModel = () => {
  const conn = getSharedConnection();
  if (conn.models.ToolQuota) {
    return conn.models.ToolQuota;
  }
  return conn.model('ToolQuota', toolQuotaSchema);
};

export default getToolQuotaModel;
