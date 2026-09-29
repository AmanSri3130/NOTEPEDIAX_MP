import express from 'express';
import { getOverview, updateProgress, completeLesson, getActivityLogs, getAchievements, getBilling, completeCourse, getCourseProgress } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all dashboard/progress routes

router.get('/overview', getOverview);
router.post('/progress/update', updateProgress);
router.post('/progress/complete-lesson', completeLesson);
router.get('/activity', getActivityLogs);
router.get('/achievements', getAchievements);
router.get('/billing', getBilling);
router.post('/courses/:id/complete', completeCourse);
router.get('/courses/:courseId/progress', getCourseProgress);

export default router;
