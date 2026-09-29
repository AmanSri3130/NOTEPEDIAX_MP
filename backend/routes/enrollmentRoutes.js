import express from 'express';
import { createOrder, verifyPayment, enrollFree, getMyCourses, getEnrollmentStatus } from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all enrollment routes

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/free', enrollFree);
router.get('/my-courses', getMyCourses);
router.get('/:courseId/status', getEnrollmentStatus);

export default router;
