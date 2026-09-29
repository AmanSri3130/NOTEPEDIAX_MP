import mongoose from 'mongoose';
import { getSharedConnection } from '../config/db.js';

const noteChunkSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ENote',
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      index: true,
    },
    headingPath: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      examCode: { type: String, default: 'JEE_MAIN', index: true },
      subject: { type: String, default: 'Physics' },
      language: { type: String, default: 'hi' },
      pageNumber: { type: Number, default: 1 },
      startChar: { type: Number, default: 0 },
      endChar: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

noteChunkSchema.index({ noteId: 1, headingPath: 1 });

export const getNoteChunkModel = () => {
  const conn = getSharedConnection();
  if (conn.models.NoteChunk) {
    return conn.models.NoteChunk;
  }
  return conn.model('NoteChunk', noteChunkSchema);
};

export default getNoteChunkModel;
