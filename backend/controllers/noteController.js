import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ENote from '../models/ENote.js';
import Order from '../models/Order.js';

const notesDirectory = fileURLToPath(new URL('../uploads/notes/', import.meta.url));
const getUserId = (req) => String(req.user?._id || req.user?.id || '');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNoteFilePath = (note) => {
  if (!note.fileUrl) return null;
  return path.join(notesDirectory, path.basename(note.fileUrl));
};

const userCanDownload = async (note, userId) => {
  if (Number(note.price) === 0) return true;
  return Boolean(await Order.model.exists({
    userId,
    status: 'verified',
    items: { $elemMatch: { itemType: 'note', itemId: String(note._id) } },
  }));
};

export const getNotes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.board && req.query.board !== 'All') filter.board = req.query.board;
    if (req.query.subject && req.query.subject !== 'All') filter.subject = req.query.subject;
    if (req.query.price === 'free') filter.price = 0;
    if (req.query.price === 'paid') filter.price = { $gt: 0 };
    if (req.query.search) {
      const search = new RegExp(escapeRegExp(String(req.query.search).slice(0, 100)), 'i');
      filter.$or = [{ title: search }, { description: search }, { subject: search }];
    }
    const notes = await ENote.model.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getENotes = getNotes;

export const getNoteBySlug = async (req, res) => {
  try {
    const note = await ENote.model.findOne({ slug: req.params.slug }).lean()
      || (mongoose.isValidObjectId(req.params.slug)
        ? await ENote.model.findById(req.params.slug).lean()
        : null);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    return res.json({ success: true, data: note });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getENoteById = getNoteBySlug;

export const createENote = async (req, res) => {
  try {
    const note = await ENote.model.create(req.body);
    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const createNoteOrder = async (req, res) => res.status(410).json({
  success: false,
  message: 'Use the cart checkout flow to purchase notes',
});

export const verifyNotePayment = async (req, res) => res.status(410).json({
  success: false,
  message: 'Note payments are verified through the cart checkout flow',
});

export const requestDownloadToken = async (req, res) => {
  const noteId = req.params.id;
  if (!mongoose.isValidObjectId(noteId)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }

  try {
    const note = await ENote.model.findById(noteId).lean();
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (!await userCanDownload(note, getUserId(req))) {
      return res.status(403).json({ success: false, message: 'Purchase this note before downloading it' });
    }
    const filePath = getNoteFilePath(note);
    if (!filePath) return res.status(404).json({ success: false, message: 'No file is configured for this note' });
    try {
      await access(filePath);
    } catch {
      return res.status(404).json({ success: false, message: 'The note file is not available on the server' });
    }

    const downloadToken = jwt.sign(
      { noteId: String(note._id), userId: getUserId(req), purpose: 'note-download' },
      process.env.JWT_SECRET || 'notepediax_jwt_secret_key',
      { expiresIn: '5m' },
    );
    return res.json({ success: true, downloadToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNoteFile = async (req, res) => {
  try {
    const claims = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET || 'notepediax_jwt_secret_key',
    );
    if (claims.purpose !== 'note-download' || !mongoose.isValidObjectId(claims.noteId)) {
      return res.status(401).json({ success: false, message: 'Invalid download token' });
    }
    const note = await ENote.model.findById(claims.noteId).lean();
    if (!note || !await userCanDownload(note, claims.userId)) {
      return res.status(403).json({ success: false, message: 'Download access is no longer valid' });
    }
    const filePath = getNoteFilePath(note);
    if (!filePath) return res.status(404).json({ success: false, message: 'No file is configured for this note' });
    try {
      await access(filePath);
    } catch {
      return res.status(404).json({ success: false, message: 'The note file is not available on the server' });
    }
    return res.download(filePath, path.basename(filePath));
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Download link is invalid or expired' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyNotes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const orders = await Order.model.find({
      userId,
      status: 'verified',
      'items.itemType': 'note',
    }).select('items').lean();
    const purchasedIds = [...new Set(
      orders.flatMap((order) => order.items
        .filter((item) => item.itemType === 'note')
        .map((item) => item.itemId)),
    )];
    const [purchased, free] = await Promise.all([
      purchasedIds.length ? ENote.model.find({ _id: { $in: purchasedIds } }).lean() : [],
      ENote.model.find({ price: 0 }).lean(),
    ]);
    return res.json({
      success: true,
      data: {
        purchased,
        free: free.filter((note) => !purchasedIds.includes(String(note._id))),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
