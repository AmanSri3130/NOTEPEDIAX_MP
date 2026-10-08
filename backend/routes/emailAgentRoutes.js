import express from 'express';
import {
  cancelEmailAgentDraft,
  createEmailAgentDraft,
  getEmailAgentDraft,
  getPendingEmailAgentDraft,
  sendEmailAgentDraft,
  updateEmailAgentDraft,
} from '../controllers/emailAgentController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('elite_student'));

router.post('/drafts', createEmailAgentDraft);
router.get('/drafts/pending', getPendingEmailAgentDraft);
router.get('/drafts/:draftId', getEmailAgentDraft);
router.patch('/drafts/:draftId', updateEmailAgentDraft);
router.post('/drafts/:draftId/send', sendEmailAgentDraft);
router.delete('/drafts/:draftId', cancelEmailAgentDraft);

export default router;
