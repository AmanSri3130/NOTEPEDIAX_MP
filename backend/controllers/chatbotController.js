import { retrieveContext, generateRAGAnswer } from '../services/ragService.js';
import { getChatHistoryModel } from '../models/ChatHistory.js';

// @desc    Ask RAG chatbot a question
// @route   POST /api/chatbot/ask
// @access  Private (or Public with guest support)
export const askChatbot = async (req, res) => {
  const { question, historyId } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }

  try {
    const userRole = req.user?.role || 'student';
    const userId = req.user?._id;

    // 1. Retrieve top relevant context chunks from NotepediaX Knowledge Base
    const contextDocs = await retrieveContext(question.trim(), 4);

    // 2. Fetch or create chat history session
    let chatHistory = null;
    let ChatHistoryModel = null;

    if (userId) {
      ChatHistoryModel = getChatHistoryModel(userRole);
      if (historyId) {
        chatHistory = await ChatHistoryModel.findOne({ _id: historyId, userId });
      }
      if (!chatHistory) {
        chatHistory = await ChatHistoryModel.create({
          userId,
          userRole,
          title: question.trim().substring(0, 40) + '...',
          messages: []
        });
      }
    }

    // 3. Generate grounded RAG answer
    const previousMessages = chatHistory ? chatHistory.messages.slice(-6) : [];
    const { answer, sources } = await generateRAGAnswer(question.trim(), contextDocs, previousMessages);

    // 4. Save to chat history if logged in
    if (chatHistory) {
      chatHistory.messages.push(
        { sender: 'user', content: question.trim() },
        { sender: 'assistant', content: answer, contextSources: sources }
      );
      await chatHistory.save();
    }

    res.json({
      success: true,
      data: {
        answer,
        sources,
        historyId: chatHistory ? chatHistory._id : null
      }
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    res.status(500).json({ success: false, message: 'Error processing question: ' + error.message });
  }
};

// @desc    Get user's chat history sessions
// @route   GET /api/chatbot/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const userRole = req.user?.role || 'student';
    const userId = req.user._id;

    const ChatHistoryModel = getChatHistoryModel(userRole);
    const histories = await ChatHistoryModel.find({ userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ success: true, data: histories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear active chat session history
// @route   DELETE /api/chatbot/clear
// @access  Private
export const clearChatHistory = async (req, res) => {
  const { historyId } = req.body;

  try {
    const userRole = req.user?.role || 'student';
    const userId = req.user._id;

    const ChatHistoryModel = getChatHistoryModel(userRole);
    if (historyId) {
      await ChatHistoryModel.deleteOne({ _id: historyId, userId });
    } else {
      await ChatHistoryModel.deleteMany({ userId });
    }

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
