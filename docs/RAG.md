# NotepediaX — Grounded RAG Pipeline Architecture

This document describes the Retrieval-Augmented Generation (RAG) pipeline powering all AI features in NotepediaX.

## Pipeline Overview

```
User Query (Text / Speech / Image OCR)
        │
        ▼
Language Detection & Translation (IndicTrans2 / English / Hindi)
        │
        ▼
Embedding Generation (1536-dim Vector)
        │
        ▼
MongoDB Atlas Vector Search (Top-K Chunks filtered by Exam & Subject)
        │
        ▼
Re-ranking & Similarity Scoring Threshold Check (Similarity >= 0.78)
   ├── High Score: Construct Grounded Prompt + Mandate Note/Chapter Citation
   └── Low Score (< 0.75): Flag General Fallback (Explicitly Uncited Warning)
        │
        ▼
LLM Router (Frontier vs Open-Weight Execution)
        │
        ▼
Response Stream with Clickable Note Chunks & Section Citations
```

## Grounding & Citation Guarantees
1. **Source Mapping:** Every `NoteChunk` embeds `headingPath`, `noteId`, `chapterId`, and page offset.
2. **Citation Link Format:** Answers embed inline markdown references pointing directly to `[Section Title](file:///notes/{noteId}?chunk={chunkId}#page={page})`.
3. **No Hallucinated Citations:** General fallback responses generated without matching retrieved chunks are explicitly tagged with `[Uncited General Explanation]`.
