import mongoose, { Document, Schema } from 'mongoose';

export interface IRagChunk extends Document {
  taxonomyIds: mongoose.Types.ObjectId[];
  exam: string[];
  classLevel: string;
  subject: string;
  topic?: string;
  contentType: 'theory' | 'formula' | 'solved_example' | 'PYQ' | 'table' | 'poem' | 'prose' | 'map' | 'diagram' | 'code' | 'current_affairs';
  difficulty: number; // 1-5
  language: string;
  year?: number;
  source: string;
  page?: string;
  ownerId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  licenseOk: boolean;
  content: string; // The actual chunk text
  embedding?: number[]; // The vector embedding
  metadataPrefix: string; // Metadata prefixed before the chunk for LLM context
}

const RagChunkSchema = new Schema<IRagChunk>(
  {
    taxonomyIds: [{ type: Schema.Types.ObjectId, ref: 'Taxonomy' }],
    exam: [{ type: String }],
    classLevel: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String },
    contentType: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    language: { type: String, default: 'en' },
    year: { type: Number },
    source: { type: String, required: true },
    page: { type: String },
    ownerId: { type: Schema.Types.ObjectId },
    courseId: { type: Schema.Types.ObjectId },
    licenseOk: { type: Boolean, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number] },
    metadataPrefix: { type: String, required: true },
  },
  { timestamps: true }
);

export const RagChunk = mongoose.model<IRagChunk>('RagChunk', RagChunkSchema);
