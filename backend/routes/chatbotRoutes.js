import express from 'express';
import { askChatbot, getChatHistory, clearChatHistory } from '../controllers/chatbotController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/ask', optionalAuth, askChatbot);
router.get('/history', protect, getChatHistory);
router.delete('/clear', protect, clearChatHistory);

export default router;
