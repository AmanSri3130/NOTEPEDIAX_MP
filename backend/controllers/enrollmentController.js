import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const getCourseId = (value) => {
  if (value && typeof value === 'object') {
    return value._id || value.id || value.courseId || value.course_id;
  }
  return value;
};

export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.model
      .find({ userId: req.user.id, status: { $in: ['active', 'completed'] } })
      .populate('courseId')
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ success: true, data: enrollments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createEnrollment = async (req, res) => {
  const courseId = getCourseId(req.body.courseId);
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ success: false, message: 'A valid course ID is required.' });
  }

  try {
    const course = await Course.model.findById(courseId).select('price').lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (Number(course.price) !== 0) {
      return res.status(403).json({
        success: false,
        message: 'Paid courses must be purchased through the cart checkout flow.',
      });
    }

    const enrollment = await Enrollment.model.findOneAndUpdate(
      { userId, courseId },
      { $set: { status: 'active' }, $setOnInsert: { userId, courseId } },
      { new: true, upsert: true, runValidators: true }
    ).populate('courseId');

    return res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (_req, res) => res.status(410).json({
  success: false,
  message: 'Use the cart checkout flow to create an order.',
});

export const verifyPayment = async (_req, res) => res.status(410).json({
  success: false,
  message: 'Payments are verified through the cart checkout flow.',
});

export const enrollFree = (req, res) => createEnrollment(req, res);
export const getMyCourses = (req, res) => getEnrollments(req, res);

export const getEnrollmentStatus = async (req, res) => {
  const courseId = getCourseId(req.params.courseId);
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ success: false, message: 'A valid course ID is required.' });
  }

  try {
    const enrolled = await Enrollment.model.exists({
      userId: req.user.id,
      courseId,
      status: { $in: ['active', 'completed'] },
    });
    return res.json({
      success: true,
      enrolled: Boolean(enrolled),
      isEnrolled: Boolean(enrolled),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
