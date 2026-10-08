import { Command } from 'commander';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { processIngestion } from '../services/ingestionService';

dotenv.config();

const program = new Command();

program
  .name('rag-ingest')
  .description('Ingest a directory of educational PDFs/txt into NotepediaX AI Tutor RAG chunks.')
  .requiredOption('-p, --path <dir>', 'Path to the directory containing source files')
  .requiredOption('-t, --taxonomy <nodeId>', 'MongoDB ObjectId of the target Taxonomy node');

program.parse(process.argv);
const options = program.opts();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is required.');

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB. Starting ingestion from ${options.path}...`);

    const report = await processIngestion(options.path, options.taxonomy);

    console.log('\n==================================');
    console.log('✅ INGESTION PIPELINE REPORT ✅');
    console.log('==================================');
    console.log(`Chunks Created successfully: ${report.chunksCreated}`);
    console.log(`Files failed to process:     ${report.failures}`);
    console.log(`Files needing OCR:           ${report.needsOcr}`);
    console.log('==================================');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error during ingestion:', error);
    process.exit(1);
  }
}

main();
