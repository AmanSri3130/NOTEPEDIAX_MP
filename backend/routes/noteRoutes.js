import express from 'express';
import { getNotes, getNoteBySlug, createNoteOrder, verifyNotePayment, requestDownloadToken, downloadNoteFile, getMyNotes } from '../controllers/noteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getNotes);
router.get('/download/:token', downloadNoteFile); // public link
router.get('/:slug', getNoteBySlug);

// Protected routes
router.use(protect);
router.post('/orders/create', createNoteOrder);
router.post('/orders/verify', verifyNotePayment);
router.get('/:id/download', requestDownloadToken);
router.get('/my/notes', getMyNotes);

export default router;
