import {
  ensureAdaptiveStudent,
  requestAdaptiveEngine,
} from '../services/adaptiveEngineService.js';

const sendError = (res, error) => {
  const statusCode = error.statusCode || 502;
  if (statusCode >= 500) {
    console.error('Adaptive learning engine request failed:', error.message);
  }
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Adaptive learning request failed.',
  });
};

const withStudent = (action) => async (req, res) => {
  try {
    const studentId = await ensureAdaptiveStudent(req.user);
    const result = await action(req, studentId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
};

const studentPath = (studentId, suffix = '') =>
  `/student/${encodeURIComponent(studentId)}${suffix}`;

export const getAdaptiveOverview = withStudent(async (_req, studentId) => {
  const [state, recommendations, revisionDue, plan] = await Promise.all([
    requestAdaptiveEngine(studentPath(studentId, '/state')),
    requestAdaptiveEngine(studentPath(studentId, '/recommendations?limit=5')),
    requestAdaptiveEngine(studentPath(studentId, '/revision-due')),
    requestAdaptiveEngine(studentPath(studentId, '/plan/today')),
  ]);

  return {
    success: true,
    data: {
      learnerState: state.data?.learner_state || null,
      recommendations: recommendations.data?.recommendations || [],
      topicsDue: revisionDue.data?.topics_due || [],
      plan: plan.success ? plan.data : null,
    },
  };
});

export const generateAdaptivePlan = withStudent(async (req, studentId) =>
  requestAdaptiveEngine(studentPath(studentId, '/optimize-plan'), {
    method: 'POST',
    body: req.body,
  })
);

export const submitAdaptiveEvent = withStudent(async (req, studentId) => {
  const event = { ...req.body, student_id: studentId };
  return requestAdaptiveEngine(studentPath(studentId, '/event'), {
    method: 'POST',
    body: event,
  });
});

export const submitAdaptiveDiagnostic = withStudent(async (req, studentId) =>
  requestAdaptiveEngine(studentPath(studentId, '/diagnostic'), {
    method: 'POST',
    body: req.body,
  })
);

export const submitAdaptivePlanFeedback = withStudent(async (req, studentId) => {
  const activityId = encodeURIComponent(req.params.activityId);
  const feedback = { ...req.body, activity_id: req.params.activityId };
  return requestAdaptiveEngine(
    studentPath(studentId, `/plan/${activityId}/feedback`),
    { method: 'POST', body: feedback }
  );
});
