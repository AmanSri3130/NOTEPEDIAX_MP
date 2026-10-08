import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is required.');

async function checkIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed.');
    }

    // Atlas Search/Vector indexes can only be checked via aggregate commands or Atlas API.
    // For this check, we verify if the collection exists and log a strong warning to check Atlas manually,
    // as well as ensuring the index JSON files exist locally.

    const collections = await db.listCollections().toArray();
    const hasRagChunks = collections.some(col => col.name === 'ragchunks');

    if (!hasRagChunks) {
      console.warn('⚠️ WARNING: "ragchunks" collection does not exist yet. Indexes cannot be attached.');
    }

    const vectorIndexFile = path.join(__dirname, 'database/indexes/rag_vector.json');
    const textIndexFile = path.join(__dirname, 'database/indexes/rag_text.json');

    if (fs.existsSync(vectorIndexFile) && fs.existsSync(textIndexFile)) {
      console.log('✅ Index JSON definitions found locally.');
      console.log('⚠️ REMINDER: You MUST manually create these indexes in the MongoDB Atlas UI.');
      console.log('   Check README.md for exact steps to create `rag_vector` and `rag_text` indexes.');
    } else {
      console.error('❌ ERROR: Index JSON files are missing in src/database/indexes/');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking indexes:', error);
    process.exit(1);
  }
}

checkIndexes();
