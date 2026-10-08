import mongoose from 'mongoose';
import Chapter from '../models/Chapter.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Review from '../models/Review.js';

const expandCourse = async (course) => {
  const courseData = course.toObject ? course.toObject() : course;
  const chapterIds = Array.isArray(courseData.chapters)
    ? courseData.chapters.map((chapter) => chapter?._id || chapter)
    : [];
  const chapters = chapterIds.length
    ? await Chapter.model.find({ _id: { $in: chapterIds } }).sort({ order: 1 }).lean()
    : await Chapter.model.find({ courseId: courseData._id }).sort({ order: 1 }).lean();

  const expandedChapters = await Promise.all(chapters.map(async (chapter) => {
    const lessonIds = Array.isArray(chapter.lessons)
      ? chapter.lessons.map((lesson) => lesson?._id || lesson)
      : [];
    const lessons = lessonIds.length
      ? await Lesson.model.find({ _id: { $in: lessonIds } }).sort({ order: 1 }).lean()
      : await Lesson.model.find({ chapterId: chapter._id }).sort({ order: 1 }).lean();
    return { ...chapter, lessons };
  }));

  return { ...courseData, chapters: expandedChapters };
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.model.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }
    const course = await Course.model.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, data: await expandCourse(course) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.model.findOne({ slug: req.params.slug })
      || (mongoose.isValidObjectId(req.params.slug)
        ? await Course.model.findById(req.params.slug)
        : null);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, data: await expandCourse(course) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.model.create(req.body);
    return res.status(201).json({ success: true, data: course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const createCourseReview = async (req, res) => {
  const courseId = req.params.id;
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || '').trim();
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ success: false, message: 'Invalid course ID' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 2000) {
    return res.status(400).json({ success: false, message: 'Provide a 1-5 rating and a comment under 2,000 characters' });
  }

  try {
    const course = await Course.model.findById(courseId).select('_id').lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const userId = String(req.user?._id || req.user?.id || '');
    const existing = await Review.model.findOne({ courseId, userId });
    if (existing) return res.status(409).json({ success: false, message: 'You have already reviewed this course' });

    const review = await Review.model.create({
      courseId,
      userId,
      userName: req.user?.name || 'Student',
      rating,
      comment,
    });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseReviews = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid course ID' });
  }
  try {
    const reviews = await Review.model.find({ courseId: req.params.id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { expandCourse };
