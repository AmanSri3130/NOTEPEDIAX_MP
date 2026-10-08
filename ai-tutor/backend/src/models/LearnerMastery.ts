import mongoose, { Document, Schema } from 'mongoose';

export interface ILearnerMastery extends Document {
  userId: mongoose.Types.ObjectId;
  taxonomyId: mongoose.Types.ObjectId;
  attempts: number;
  correct: number;
  lastSeenAt: Date;
  masteryScore: number; // 0 to 1
  nextReviewAt: Date;
}

const LearnerMasterySchema = new Schema<ILearnerMastery>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    taxonomyId: { type: Schema.Types.ObjectId, ref: 'Taxonomy', required: true },
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now },
    masteryScore: { type: Number, default: 0, min: 0, max: 1 },
    nextReviewAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

LearnerMasterySchema.index({ userId: 1, taxonomyId: 1 }, { unique: true });
LearnerMasterySchema.index({ userId: 1, nextReviewAt: 1 });

export const LearnerMastery = mongoose.model<ILearnerMastery>('LearnerMastery', LearnerMasterySchema);
