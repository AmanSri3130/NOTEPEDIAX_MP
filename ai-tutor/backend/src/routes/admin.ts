import express from 'express';
import { Taxonomy } from '../models/Taxonomy';
import { RagChunk } from '../models/RagChunk';
import { CoverageGap } from '../models/CoverageGap';

const router = express.Router();

router.get('/coverage', async (req, res) => {
  try {
    // 1. Top Coverage Gaps
    const topGaps = await CoverageGap.find()
      .sort({ count: -1 })
      .limit(10);

    // 2. Taxonomy Coverage
    const taxonomyNodes = await Taxonomy.find();

    const coverageStats = await Promise.all(
      taxonomyNodes.map(async (node) => {
        const chunks = await RagChunk.find({ taxonomyIds: node._id });
        const count = chunks.length;

        let status = 'none';
        if (count > 20) status = 'good';
        else if (count > 0) status = 'thin';

        const types = chunks.reduce((acc: any, chunk) => {
          acc[chunk.contentType] = (acc[chunk.contentType] || 0) + 1;
          return acc;
        }, {});

        // Just get the most recent chunk for 'last updated'
        const lastUpdated = chunks.length > 0
          ? chunks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
          : null;

        return {
          nodeId: node._id,
          stage: node.stage,
          classOrLevel: node.classOrLevel,
          subject: node.subject,
          chapter: node.chapter,
          chunkCount: count,
          contentTypeMix: types,
          coverageStatus: status,
          lastUpdated
        };
      })
    );

    res.json({
      success: true,
      data: {
        topGaps,
        coverageStats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching coverage' });
  }
});

export default router;
