import { RagChunk, IRagChunk } from '../models/RagChunk';
import { CoverageGap } from '../models/CoverageGap';

// Mock Reciprocal Rank Fusion (RRF)
const reciprocalRankFusion = (vectorResults: any[], textResults: any[]): any[] => {
  const k = 60;
  const scores = new Map<string, { chunk: any, score: number }>();

  vectorResults.forEach((doc, rank) => {
    const id = doc._id.toString();
    scores.set(id, { chunk: doc, score: 1 / (k + rank + 1) });
  });

  textResults.forEach((doc, rank) => {
    const id = doc._id.toString();
    if (scores.has(id)) {
      scores.get(id)!.score += 1 / (k + rank + 1);
    } else {
      scores.set(id, { chunk: doc, score: 1 / (k + rank + 1) });
    }
  });

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => ({ ...x.chunk.toObject(), _rrfScore: x.score }));
};

export const retrieveContext = async (
  query: string,
  userClass: string,
  language: string,
  userId: string,
  taxonomyGuess?: string
): Promise<any[]> => {
  const minScore = 0.015; // Simulated AppConfig rag.minScore

  // Simulated Atlas Vector Search
  const vectorResults = await RagChunk.find({ classLevel: userClass }).limit(20);

  // Simulated Atlas Text Search
  const textResults = await RagChunk.find({ classLevel: userClass }).limit(20);

  const fusedResults = reciprocalRankFusion(vectorResults, textResults);

  const finalResults = fusedResults.filter(r => r._rrfScore >= minScore);

  if (finalResults.length === 0) {
    // Gap Logging
    await CoverageGap.findOneAndUpdate(
      { query },
      {
        $inc: { count: 1 },
        $setOnInsert: { taxonomyGuess, userClass }
      },
      { upsert: true }
    );
    return []; // Signals gap
  }

  return finalResults;
};
