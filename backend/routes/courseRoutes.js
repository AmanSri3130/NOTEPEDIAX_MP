import express from 'express';
import { getCourses, getCourseBySlug, createCourseReview, getCourseReviews } from '../controllers/courseController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);
router.get('/:id/reviews', getCourseReviews);
router.post('/:id/reviews', protect, createCourseReview);

export default router;
