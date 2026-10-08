import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { handleTutorQuery } from './services/tutorService';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is required.');

app.use('/api/admin', adminRoutes);

app.post('/api/tutor/ask', async (req, res) => {
  try {
    const { query, userClass, userId } = req.body;

    if (!query || !userClass) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing query or userClass' } });
    }

    const response = await handleTutorQuery(
      query,
      userClass,
      userId || new mongoose.Types.ObjectId().toString()
    );

    return res.json({ success: true, data: response });
  } catch (error) {
    console.error('Tutor Error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
  }
});

const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`AI Tutor Backend running on http://localhost:${PORT}`);
      console.log(`Send a POST to http://localhost:${PORT}/api/tutor/ask with { "query": "hello", "userClass": "Class 11" } to test it.`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. (If this fails due to IP/DNS, the server will not start)', err.message);
  });
