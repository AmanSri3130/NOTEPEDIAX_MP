import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeCourse,
  getAchievements,
  getOverview,
} from '../controllers/dashboardController.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';

test('dashboard overview returns MongoDB enrollment and completion data', async () => {
  const originalEnrollmentCount = Enrollment.model.countDocuments;
  const originalEnrollmentFindOne = Enrollment.model.findOne;
  const originalLessonCount = Lesson.model.countDocuments;
  const originalProgressCount = LessonProgress.model.countDocuments;
  let enrollmentQuery;

  try {
    Enrollment.model.countDocuments = async () => 2;
    Enrollment.model.findOne = (query) => {
      enrollmentQuery = query;
      return {
        sort() { return this; },
        populate() { return this; },
        lean: async () => ({
          courseId: {
            _id: 'course-id',
            title: 'Physics',
            slug: 'physics',
            category: 'JEE',
          },
        }),
      };
    };
    Lesson.model.countDocuments = async () => 4;
    LessonProgress.model.countDocuments = async (query) =>
      query.courseId ? 2 : 3;

    let responseBody;
    const response = {
      json(body) {
        responseBody = body;
        return this;
      },
      status(statusCode) {
        this.statusCode = statusCode;
        return this;
      },
    };

    await getOverview({ user: { id: 'student-id', role: 'elite_student' } }, response);

    assert.equal(response.statusCode, undefined);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data.stats.enrolledCount, 2);
    assert.equal(responseBody.data.stats.lecturesDone, 3);
    assert.equal(responseBody.data.resumeCourse.title, 'Physics');
    assert.equal(responseBody.data.resumeCourse.completionPercent, 50);
    assert.equal(enrollmentQuery.status.$ne, 'cancelled');
  } finally {
    Enrollment.model.countDocuments = originalEnrollmentCount;
    Enrollment.model.findOne = originalEnrollmentFindOne;
    Lesson.model.countDocuments = originalLessonCount;
    LessonProgress.model.countDocuments = originalProgressCount;
  }
});

test('achievements start from persisted account XP and actual enrollment data', async () => {
  const originalCount = Enrollment.model.countDocuments;
  try {
    Enrollment.model.countDocuments = async () => 0;
    let result;
    const response = { json(body) { result = body; return this; } };

    await getAchievements({ user: { id: 'student-id' } }, response);

    assert.equal(result.data.xp, 0);
    assert.equal(result.data.level, 1);
    assert.deepEqual(result.data.badges, []);
  } finally {
    Enrollment.model.countDocuments = originalCount;
  }
});

test('course completion generates a real PDF only after all lessons are complete', async () => {
  const originals = {
    findById: Course.model.findById,
    enrollmentExists: Enrollment.model.exists,
    enrollmentUpdate: Enrollment.model.updateOne,
    lessonFind: Lesson.model.find,
    progressFind: LessonProgress.model.find,
  };
  try {
    Course.model.findById = () => ({
      select: () => ({ lean: async () => ({ title: 'Physics Foundations' }) }),
    });
    Enrollment.model.exists = async () => true;
    Enrollment.model.updateOne = async () => ({ modifiedCount: 1 });
    Lesson.model.find = () => ({
      select() { return this; },
      lean: async () => [{ _id: 'lesson-1' }],
    });
    LessonProgress.model.find = () => ({
      select() { return this; },
      lean: async () => [{ lessonId: 'lesson-1' }],
    });
    let result;
    const response = { json(body) { result = body; return this; } };

    await completeCourse({
      params: { id: '64b000000000000000000001' },
      user: { id: 'student-id', name: 'Asha Student' },
    }, response);

    assert.equal(result.success, true);
    assert.match(result.certificateUrl, /^data:application\/pdf;base64,/);
    const pdfBytes = Buffer.from(result.certificateUrl.split(',')[1], 'base64');
    assert.equal(pdfBytes.subarray(0, 5).toString(), '%PDF-');
  } finally {
    Course.model.findById = originals.findById;
    Enrollment.model.exists = originals.enrollmentExists;
    Enrollment.model.updateOne = originals.enrollmentUpdate;
    Lesson.model.find = originals.lessonFind;
    LessonProgress.model.find = originals.progressFind;
  }
});
