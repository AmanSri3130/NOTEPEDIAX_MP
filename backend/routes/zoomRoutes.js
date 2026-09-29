import express from 'express';
import { getClassesByCourse, getDashboardClasses, registerForClass, joinClass } from '../controllers/zoomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all zoom routes

router.get('/classes', getClassesByCourse);
router.get('/dashboard-classes', getDashboardClasses);
router.post('/register/:classId', registerForClass);
router.get('/join/:classId', joinClass);

export default router;
