import mongoose, { Document, Schema } from 'mongoose';

export interface IRagLog extends Document {
  query: string;
  answer: string;
  faithfulnessScore: number;
  gapResponseSent: boolean;
  unsupportedClaims: number;
  latencyMs: number;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RagLogSchema = new Schema<IRagLog>(
  {
    query: { type: String, required: true },
    answer: { type: String, required: true },
    faithfulnessScore: { type: Number, required: true },
    gapResponseSent: { type: Boolean, default: false },
    unsupportedClaims: { type: Number, default: 0 },
    latencyMs: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now, expires: '90d' }, // TTL 90 days
  }
);

export const RagLog = mongoose.model<IRagLog>('RagLog', RagLogSchema);
