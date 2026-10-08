import assert from 'node:assert/strict';
import test from 'node:test';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { createEnrollment, getEnrollmentStatus } from '../controllers/enrollmentController.js';

const responseRecorder = () => {
  const response = { statusCode: 200, body: null };
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  return response;
};

test('does not grant free enrollment for a paid course', async () => {
  const originalFindById = Course.model.findById;
  const originalFindOneAndUpdate = Enrollment.model.findOneAndUpdate;
  try {
    Course.model.findById = () => ({
      select: () => ({ lean: async () => ({ price: 499 }) }),
    });
    Enrollment.model.findOneAndUpdate = async () => {
      throw new Error('paid courses must not create free enrollments');
    };

    const response = responseRecorder();
    await createEnrollment({ body: { courseId: '64b000000000000000000001' }, user: { id: 'student-id' } }, response);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.success, false);
  } finally {
    Course.model.findById = originalFindById;
    Enrollment.model.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('enrollment status provides the field consumed by course detail', async () => {
  const originalExists = Enrollment.model.exists;
  try {
    Enrollment.model.exists = async () => true;
    const response = responseRecorder();
    await getEnrollmentStatus({
      params: { courseId: '64b000000000000000000001' },
      user: { id: 'student-id' },
    }, response);

    assert.equal(response.body.enrolled, true);
    assert.equal(response.body.isEnrolled, true);
  } finally {
    Enrollment.model.exists = originalExists;
  }
});
