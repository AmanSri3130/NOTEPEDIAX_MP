# NotepediaX AI Tutor

This is the RAG-based AI Tutor for NotepediaX, built with MERN stack, TypeScript, and MongoDB Atlas Vector Search.

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in `backend/` with:
   ```env
   MONGO_URI="mongodb+srv://<username>:<password>@<cluster>/<database>"
   ```

3. **Run Seed & Checks**
   ```bash
   npm run seed
   npm run check-indexes
   ```

## Creating Atlas Search Indexes

You **MUST** manually create these indexes in your MongoDB Atlas Dashboard for retrieval to work.

### 1. Vector Search Index (`rag_vector`)
1. Go to your MongoDB Atlas Dashboard.
2. Select **Search** -> **Create Search Index**.
3. Choose **JSON Editor**.
4. Database: `rag_database`, Collection: `ragchunks`.
5. Name the index **`rag_vector`**.
6. Paste the contents of `src/database/indexes/rag_vector.json`.
7. Click **Next** and **Create Index**.

### 2. Full-Text Search Index (`rag_text`)
1. In the Atlas Dashboard, go to **Search** -> **Create Search Index**.
2. Choose **JSON Editor**.
3. Database: `rag_database`, Collection: `ragchunks`.
4. Name the index **`rag_text`**.
5. Paste the contents of `src/database/indexes/rag_text.json`.
6. Click **Next** and **Create Index**.
