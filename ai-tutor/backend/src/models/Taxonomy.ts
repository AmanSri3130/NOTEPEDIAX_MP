import mongoose, { Document, Schema } from 'mongoose';

export interface ITaxonomy extends Document {
  stage: string; // e.g., 'School', 'Graduation', 'Exams'
  boardOrExam: string; // e.g., 'CBSE', 'JEE Main'
  classOrLevel: string; // e.g., 'Class 11', 'BTech Sem 1'
  subject: string; // e.g., 'Physics', 'Computing'
  unit?: string;
  chapter: string;
  topic?: string;
  subtopic?: string;
  tags: string[]; // Cross-tagging for other exams
}

const TaxonomySchema = new Schema<ITaxonomy>(
  {
    stage: { type: String, required: true },
    boardOrExam: { type: String, required: true },
    classOrLevel: { type: String, required: true },
    subject: { type: String, required: true },
    unit: { type: String },
    chapter: { type: String, required: true },
    topic: { type: String },
    subtopic: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for fast lookup
TaxonomySchema.index({ stage: 1, boardOrExam: 1, classOrLevel: 1, subject: 1 });
TaxonomySchema.index({ tags: 1 });

export const Taxonomy = mongoose.model<ITaxonomy>('Taxonomy', TaxonomySchema);
