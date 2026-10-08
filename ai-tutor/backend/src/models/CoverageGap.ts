import mongoose, { Document, Schema } from 'mongoose';

export interface ICoverageGap extends Document {
  query: string;
  taxonomyGuess?: string;
  userClass?: string;
  count: number;
}

const CoverageGapSchema = new Schema<ICoverageGap>(
  {
    query: { type: String, required: true },
    taxonomyGuess: { type: String },
    userClass: { type: String },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

CoverageGapSchema.index({ query: 1 });

export const CoverageGap = mongoose.model<ICoverageGap>('CoverageGap', CoverageGapSchema);
