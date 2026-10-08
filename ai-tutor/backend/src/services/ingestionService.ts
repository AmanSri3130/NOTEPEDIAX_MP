import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Taxonomy } from '../models/Taxonomy';
import { RagChunk } from '../models/RagChunk';

// Mock embedding generator for Phase 2 (768 dimensions)
const generateEmbedding = async (text: string): Promise<number[]> => {
  return Array.from({ length: 768 }, () => Math.random() * 0.1);
};

export const processIngestion = async (dirPath: string, taxonomyId: string) => {
  let chunksCreated = 0;
  let failures = 0;
  let needsOcr = 0;

  try {
    const taxonomy = await Taxonomy.findById(taxonomyId);
    if (!taxonomy) throw new Error(`Taxonomy node ${taxonomyId} not found`);

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);

      try {
        let text = '';

        if (file.endsWith('.pdf')) {
          const dataBuffer = fs.readFileSync(filePath);
          const data = await pdfParse(dataBuffer);
          text = data.text;

          if (text.trim().length < 50) {
            needsOcr++;
            console.warn(`[Needs OCR] ${file}: PDF appears to be scanned images.`);
            continue;
          }
        } else if (file.endsWith('.txt') || file.endsWith('.md')) {
          text = fs.readFileSync(filePath, 'utf-8');
        } else {
          continue; // Skip unsupported files
        }

        // Extremely simplified content-aware chunker for demonstration
        // In a real scenario, this would use AST or complex regex per content type
        const rawChunks = text.split('\n\n').filter(c => c.trim().length > 20);

        for (let i = 0; i < rawChunks.length; i++) {
          const chunkText = rawChunks[i].trim();

          // Determine type heuristically (mock)
          let cType = 'theory';
          if (chunkText.includes('$$') || chunkText.includes('=')) cType = 'formula';
          else if (chunkText.toLowerCase().includes('example') || chunkText.toLowerCase().includes('solution')) cType = 'solved_example';

          const metadataPrefix = `Subject: ${taxonomy.subject}, Class: ${taxonomy.classOrLevel}. Topic: ${taxonomy.topic || taxonomy.chapter}.`;
          const embedding = await generateEmbedding(chunkText);

          await RagChunk.create({
            taxonomyIds: [taxonomy._id],
            exam: taxonomy.tags || [],
            classLevel: taxonomy.classOrLevel,
            subject: taxonomy.subject,
            topic: taxonomy.topic || taxonomy.chapter,
            contentType: cType,
            difficulty: 3,
            language: 'en', // Could detect automatically
            source: file,
            licenseOk: true, // Must explicitly be set to true per spec
            metadataPrefix,
            content: chunkText,
            embedding
          });

          chunksCreated++;
        }
      } catch (err) {
        console.error(`Failed to process ${file}:`, err);
        failures++;
      }
    }

    return { chunksCreated, failures, needsOcr };
  } catch (error) {
    console.error('Ingestion pipeline failed:', error);
    throw error;
  }
};
