import mongoose from 'mongoose';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import ActivityLog from '../models/ActivityLog.js';
import Chapter from '../models/Chapter.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import EliteStudent from '../models/EliteStudent.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import FreeStudent from '../models/FreeStudent.js';
import Order from '../models/Order.js';

const findLessonCourseId = async (lesson) => {
  let courseId = lesson.courseId || lesson.course_id || lesson.course;
  if (courseId && typeof courseId === 'object') courseId = courseId._id || courseId.id;
  if (courseId) return courseId;

  let chapterId = lesson.chapterId || lesson.chapter_id || lesson.chapter;
  if (chapterId && typeof chapterId === 'object') chapterId = chapterId._id || chapterId.id;
  if (!chapterId || !mongoose.isValidObjectId(chapterId)) return null;

  const chapter = await Chapter.model.findById(chapterId).lean();
  courseId = chapter?.courseId || chapter?.course_id || chapter?.course;
  if (courseId && typeof courseId === 'object') courseId = courseId._id || courseId.id;
  return courseId || null;
};

const awardLessonXpOnce = async (progress, req) => {
  if (!progress.isCompleted || progress.xpAwarded) return;

  const claimed = await LessonProgress.model.findOneAndUpdate(
    { _id: progress._id, isCompleted: true, xpAwarded: { $ne: true } },
    { $set: { xpAwarded: true } },
    { new: false }
  );
  if (!claimed) return;

  const studentModel = req.user.role === 'elite_student' ? EliteStudent : FreeStudent;
  await studentModel.updateOne({ _id: req.user.id }, { $inc: { xp: 10 } });
};

// Get dashboard overview stats
export const getOverview = async (req, res) => {
  const userId = req.user?.id;

  try {
    const [enrolledCount, lecturesDone, lastEnrollment] = await Promise.all([
      Enrollment.model.countDocuments({ userId, status: { $ne: 'cancelled' } }),
      LessonProgress.model.countDocuments({ userId, isCompleted: true }),
      Enrollment.model.findOne({ userId, status: { $ne: 'cancelled' } })
        .sort({ updatedAt: -1 })
        .populate('courseId')
        .lean(),
    ]);

    let resumeCourse = null;
    const course = lastEnrollment?.courseId;
    if (course && typeof course === 'object' && course._id) {
      const courseId = course._id;
      const [lessonCount, completedCount] = await Promise.all([
        Lesson.model.countDocuments({
          $or: [{ courseId }, { course_id: courseId }, { course: courseId }],
        }),
        LessonProgress.model.countDocuments({
          userId,
          courseId,
          isCompleted: true,
        }),
      ]);
      resumeCourse = {
        id: String(course._id),
        title: course.title || course.name || 'Course',
        slug: course.slug || String(course._id),
        category: course.category || '',
        completionPercent: lessonCount
          ? Math.round((completedCount / lessonCount) * 100)
          : 0,
        chapterTitle: 'Chapter 1: Getting Started',
        lessonTitle: 'Welcome & System Overview',
      };
    }

    res.json({
      success: true,
      data: {
        stats: {
          enrolledCount,
          streak: req.user?.streak || 0,
          rank: (req.user?.level || 1) * 10 + 2,
          lecturesDone,
          xp: req.user?.xp || 0,
        },
        resumeCourse,
        recentLogs: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lesson watch duration progress
export const updateProgress = async (req, res) => {
  const { lessonId, watchedDuration, totalDuration, watchedDeltaSeconds = 0 } = req.body;
  const userId = req.user.id;
  const position = Number(watchedDuration);
  const duration = Number(totalDuration);
  const watchDelta = Number(watchedDeltaSeconds);

  if (
    !mongoose.isValidObjectId(lessonId) ||
    !Number.isFinite(position) ||
    position < 0 ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    !Number.isFinite(watchDelta) ||
    watchDelta < 0 ||
    watchDelta > 12
  ) {
    return res.status(400).json({ success: false, message: 'Invalid lesson progress values.' });
  }

  try {
    const lesson = await Lesson.model.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });
    const courseId = await findLessonCourseId(lesson);
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Lesson is not linked to a course.' });
    }

    const enrolled = await Enrollment.model.exists({
      userId,
      courseId,
      status: { $in: ['active', 'completed'] },
    });
    if (!enrolled) return res.status(403).json({ success: false, message: 'Course enrollment required.' });

    const existing = await LessonProgress.model.findOne({ userId, lessonId }).lean();
    const completionPercent = Math.min(
      100,
      Math.round((Math.max(position, existing?.watchedDuration || 0) / duration) * 100)
    );
    const progress = await LessonProgress.model.findOneAndUpdate(
      { userId, lessonId },
      {
        $max: {
          watchedDuration: position,
          completionPercent,
          isCompleted: completionPercent >= 80,
        },
        $set: {
          courseId,
          totalDuration: duration,
          lastWatchedAt: new Date(),
        },
        $inc: { totalWatchSeconds: watchDelta },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await awardLessonXpOnce(progress, req);
    return res.json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Manually complete lesson
export const completeLesson = async (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(lessonId)) {
    return res.status(400).json({ success: false, message: 'A valid lesson ID is required.' });
  }

  try {
    const lesson = await Lesson.model.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });
    const courseId = await findLessonCourseId(lesson);
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Lesson is not linked to a course.' });
    }
    const enrolled = await Enrollment.model.exists({
      userId,
      courseId,
      status: { $in: ['active', 'completed'] },
    });
    if (!enrolled) return res.status(403).json({ success: false, message: 'Course enrollment required.' });

    const progress = await LessonProgress.model.findOneAndUpdate(
      { userId, lessonId },
      {
        $set: {
          courseId,
          completionPercent: 100,
          isCompleted: true,
          lastWatchedAt: new Date(),
        },
        $setOnInsert: { totalWatchSeconds: 0, xpAwarded: false },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await awardLessonXpOnce(progress, req);
    return res.json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get filterable activity log
export const getActivityLogs = async (req, res) => {
  const userId = String(req.user?._id || req.user?.id || '');

  try {
    const logs = await ActivityLog.model.find({
      $or: [{ userId }, { user_id: userId }],
    }).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get achievements, badges, level
export const getAchievements = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || '');
    const enrollmentCount = await Enrollment.model.countDocuments({
      userId,
      status: { $in: ['active', 'completed'] },
    });
    const badges = enrollmentCount > 0
      ? [{ id: 'first_enroll', name: 'First Enrollment', desc: 'Enrolled in your first course', earned: true }]
      : [];

    return res.json({
      success: true,
      data: {
        xp: Number(req.user?.xp || 0),
        level: Number(req.user?.level || 1),
        badges,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get billing subscriptions
export const getBilling = async (req, res) => {
  const userId = String(req.user?._id || req.user?.id || '');

  try {
    const orders = await Order.model.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: {
        subscription: req.user?.subscription || { plan: 'free' },
        orders,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Complete course
export const completeCourse = async (req, res) => {
  const courseId = req.params.id;
  const userId = String(req.user?._id || req.user?.id || '');
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ success: false, message: 'A valid course ID is required.' });
  }

  try {
    const [course, enrollment, lessons, completedProgress] = await Promise.all([
      Course.model.findById(courseId).select('title').lean(),
      Enrollment.model.exists({
        userId,
        courseId,
        status: { $in: ['active', 'completed'] },
      }),
      Lesson.model.find({
        $or: [{ courseId }, { course_id: courseId }, { course: courseId }],
      }).select('_id').lean(),
      LessonProgress.model.find({
        userId,
        courseId,
        isCompleted: true,
      }).select('lessonId').lean(),
    ]);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!enrollment) return res.status(403).json({ success: false, message: 'Enroll in this course before completing it.' });

    const completedIds = new Set(completedProgress.map((progress) => String(progress.lessonId)));
    if (lessons.length === 0 || lessons.some((lesson) => !completedIds.has(String(lesson._id)))) {
      return res.status(409).json({ success: false, message: 'Complete every lesson before generating a certificate.' });
    }

    await Enrollment.model.updateOne(
      { userId, courseId, status: { $ne: 'cancelled' } },
      { $set: { status: 'completed' } },
    );

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const printable = (value) => String(value || '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
    const studentName = printable(req.user?.name) || 'Student';
    const courseTitle = printable(course.title) || 'Course';

    page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderWidth: 2, borderColor: rgb(0.42, 0.22, 0.69) });
    page.drawText('NOTEPEDIAX', { x: 350, y: 470, size: 16, font: bold, color: rgb(0.42, 0.22, 0.69) });
    page.drawText('CERTIFICATE OF COMPLETION', { x: 194, y: 390, size: 28, font: bold, color: rgb(0.12, 0.15, 0.2) });
    page.drawText('This certifies that', { x: 346, y: 330, size: 14, font: regular });
    page.drawText(studentName, { x: 260, y: 282, size: 30, font: bold, color: rgb(0.42, 0.22, 0.69) });
    page.drawText('has successfully completed', { x: 315, y: 242, size: 14, font: regular });
    page.drawText(courseTitle.slice(0, 90), { x: 120, y: 205, size: 20, font: bold });
    page.drawText(`Completed on ${new Date().toLocaleDateString('en-IN')}`, { x: 333, y: 130, size: 12, font: regular });
    page.drawText('Notepediax Learning Platform', { x: 330, y: 90, size: 11, font: regular, color: rgb(0.35, 0.35, 0.35) });

    const certificate = Buffer.from(await pdf.save()).toString('base64');
    return res.json({
      success: true,
      certificateUrl: `data:application/pdf;base64,${certificate}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get course progress
export const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ success: false, message: 'A valid course ID is required.' });
  }

  try {
    const [lessons, lessonProgresses] = await Promise.all([
      Lesson.model.find({
        $or: [{ courseId }, { course_id: courseId }, { course: courseId }],
      }).select('_id').lean(),
      LessonProgress.model.find({ userId, courseId }).lean(),
    ]);
    const completedLessons = lessonProgresses
      .filter((progress) => progress.isCompleted)
      .map((progress) => String(progress.lessonId));
    const completionPercent = lessons.length
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;
    const progress = {
      courseId,
      completionPercent,
      completedLessons,
      isCompleted: lessons.length > 0 && completedLessons.length === lessons.length,
    };

    return res.json({
      success: true,
      data: {
        progress,
        lessonProgresses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
