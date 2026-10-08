import mongoose from 'mongoose';
import EliteStudent from '../models/EliteStudent.js';
import Enrollment from '../models/Enrollment.js';
import FreeStudent from '../models/FreeStudent.js';
import LessonProgress from '../models/LessonProgress.js';

const ACTIVE_ENROLLMENT_STATUSES = ['active', 'completed', 'paid', 'enrolled'];

const getEnrolledStudentIds = async () => {
  const enrollments = await Enrollment.model.aggregate([
    {
      $project: {
        statusValue: { $ifNull: ['$status', '$data.status'] },
        userValue: {
          $ifNull: [
            '$userId',
            { $ifNull: ['$user_id', { $ifNull: ['$user', { $ifNull: ['$data.user_id', '$data.userId'] }] }] },
          ],
        },
        courseValue: {
          $ifNull: [
            '$courseId',
            { $ifNull: ['$course_id', { $ifNull: ['$course', { $ifNull: ['$data.course_id', '$data.courseId'] }] }] },
          ],
        },
      },
    },
    {
      $match: {
        courseValue: { $ne: null },
        $or: [
          { statusValue: { $exists: false } },
          { statusValue: null },
          { statusValue: { $in: ACTIVE_ENROLLMENT_STATUSES } },
        ],
      },
    },
    {
      $project: {
        userValue: { $ifNull: ['$userValue._id', '$userValue'] },
      },
    },
    {
      $project: {
        userId: {
          $convert: {
            input: '$userValue',
            to: 'string',
            onError: '',
            onNull: '',
          },
        },
      },
    },
    { $match: { userId: { $ne: '' } } },
    { $group: { _id: '$userId', enrolledCourseCount: { $sum: 1 } } },
  ]);

  return enrollments.filter((entry) => mongoose.isValidObjectId(entry._id));
};

const getWatchTimes = async (studentIds) => {
  if (!studentIds.length) return new Map();

  const totals = await LessonProgress.model.aggregate([
    {
      $project: {
        userValue: {
          $ifNull: [
            '$userId',
            { $ifNull: ['$user_id', { $ifNull: ['$user', { $ifNull: ['$data.user_id', '$data.userId'] }] }] },
          ],
        },
        secondsValue: {
          $ifNull: [
            '$totalWatchSeconds',
            { $ifNull: ['$total_watch_seconds', '$data.totalWatchSeconds'] },
          ],
        },
      },
    },
    { $project: { userValue: { $ifNull: ['$userValue._id', '$userValue'] }, secondsValue: 1 } },
    {
      $project: {
        userId: { $convert: { input: '$userValue', to: 'string', onError: '', onNull: '' } },
        seconds: {
          $convert: { input: '$secondsValue', to: 'double', onError: 0, onNull: 0 },
        },
      },
    },
    { $match: { userId: { $in: studentIds } } },
    { $group: { _id: '$userId', watchTimeSeconds: { $sum: '$seconds' } } },
  ]);

  return new Map(totals.map((entry) => [entry._id, Math.max(0, Math.floor(entry.watchTimeSeconds))]));
};

export const rankLeaderboardRows = (students, enrolledStudents, watchTimes) =>
  students
    .map((student) => {
      const id = String(student._id);
      return {
        id,
        name: student.name,
        xp: Number.isFinite(Number(student.xp)) ? Math.max(0, Number(student.xp)) : 0,
        watchTimeSeconds: watchTimes.get(id) || 0,
        enrolledCourseCount: enrolledStudents.get(id) || 0,
      };
    })
    .sort((a, b) => b.xp - a.xp || b.watchTimeSeconds - a.watchTimeSeconds || a.name.localeCompare(b.name))
    .map((student, index) => ({ ...student, rank: index + 1 }));

export const getLeaderboard = async (req, res) => {
  const role = req.user?.role;
  if (role !== 'elite_student' && role !== 'free_student') {
    return res.status(403).json({ success: false, message: 'Student leaderboard access only.' });
  }

  try {
    const enrollmentRows = await getEnrolledStudentIds();
    const enrolledStudents = new Map(
      enrollmentRows.map(({ _id, enrolledCourseCount }) => [String(_id), enrolledCourseCount])
    );
    const enrolledIds = enrollmentRows.map(({ _id }) => new mongoose.Types.ObjectId(_id));
    const studentModel = role === 'elite_student' ? EliteStudent : FreeStudent;
    const students = enrolledIds.length
      ? await studentModel.find({ _id: { $in: enrolledIds } }).select('name xp').lean()
      : [];
    const studentIds = students.map((student) => String(student._id));
    const watchTimes = await getWatchTimes(studentIds);
    const rankings = rankLeaderboardRows(students, enrolledStudents, watchTimes);

    return res.json({
      success: true,
      data: {
        cohort: role,
        rankings,
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to load MongoDB leaderboard:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not load the leaderboard from student records.',
    });
  }
};
