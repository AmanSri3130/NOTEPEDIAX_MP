import mongoose from 'mongoose';
import ZoomClass from '../models/ZoomClass.js';
import ZoomRegistration from '../models/ZoomRegistration.js';

const getUserId = (req) => String(req.user?._id || req.user?.id || '');

export const getZoomClasses = async (req, res) => {
  try {
    const classes = await ZoomClass.model.find().sort({ startsAt: 1 }).lean();
    return res.json({ success: true, data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassesByCourse = getZoomClasses;

export const getDashboardClasses = async (req, res) => {
  try {
    const now = new Date();
    const classes = await ZoomClass.model.find({
      $or: [{ startsAt: { $gte: now } }, { startsAt: { $exists: false } }],
    }).sort({ startsAt: 1 }).limit(10).lean();
    return res.json({ success: true, data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForClass = async (req, res) => {
  const { classId } = req.params;
  if (!mongoose.isValidObjectId(classId)) {
    return res.status(400).json({ success: false, message: 'Invalid class ID' });
  }

  try {
    const exists = await ZoomClass.model.exists({ _id: classId });
    if (!exists) return res.status(404).json({ success: false, message: 'Class not found' });

    try {
      const registration = await ZoomRegistration.model.create({
        classId,
        userId: getUserId(req),
      });
      return res.status(201).json({ success: true, data: registration });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'You are already registered for this class' });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const joinClass = async (req, res) => {
  const { classId } = req.params;
  if (!mongoose.isValidObjectId(classId)) {
    return res.status(400).json({ success: false, message: 'Invalid class ID' });
  }

  try {
    const classInfo = await ZoomClass.model.findById(classId).lean();
    if (!classInfo) return res.status(404).json({ success: false, message: 'Class not found' });
    const registration = await ZoomRegistration.model.exists({
      classId,
      userId: getUserId(req),
    });
    if (!registration) return res.status(403).json({ success: false, message: 'Register for this class before joining' });
    if (!classInfo.joinUrl) {
      return res.status(503).json({ success: false, message: 'The instructor has not configured a meeting link yet' });
    }

    return res.json({ success: true, joinUrl: classInfo.joinUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
