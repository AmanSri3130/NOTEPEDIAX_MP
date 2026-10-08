import express from 'express';
import {
  generateAdaptivePlan,
  getAdaptiveOverview,
  submitAdaptiveDiagnostic,
  submitAdaptiveEvent,
  submitAdaptivePlanFeedback,
} from '../controllers/adaptiveEngineController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('elite_student'));

router.get('/overview', getAdaptiveOverview);
router.post('/plan', generateAdaptivePlan);
router.post('/event', submitAdaptiveEvent);
router.post('/diagnostic', submitAdaptiveDiagnostic);
router.post('/plan/:activityId/feedback', submitAdaptivePlanFeedback);

export default router;
