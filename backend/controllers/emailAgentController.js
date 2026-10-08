import mongoose from 'mongoose';
import EmailAgentDraft from '../models/EmailAgentDraft.js';
import {
  generateEmailDraft,
  assertEmailSendingConfigured,
  isValidEmailAddress,
  sendApprovedEmail,
} from '../services/emailAgentService.js';

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error('Elite email agent request failed:', error.message);
  }
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Email assistant request failed.',
  });
};

const getOwnedPendingDraft = async (draftId, userId) => {
  if (!mongoose.isValidObjectId(draftId)) return null;
  return EmailAgentDraft.findOne({ _id: draftId, userId, status: 'pending' });
};

export const createEmailAgentDraft = async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 4000) {
    return res.status(400).json({
      success: false,
      message: 'Enter an email request of 1 to 4,000 characters.',
    });
  }

  try {
    const draft = await EmailAgentDraft.create({
      userId: req.user._id,
      ...(await generateEmailDraft(message)),
    });
    return res.status(201).json({ success: true, data: { draft } });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getEmailAgentDraft = async (req, res) => {
  try {
    const draft = await getOwnedPendingDraft(req.params.draftId, req.user._id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Pending email draft not found.' });
    }
    return res.json({ success: true, data: { draft } });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getPendingEmailAgentDraft = async (req, res) => {
  try {
    const draft = await EmailAgentDraft.findOne({
      userId: req.user._id,
      status: 'pending',
    }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { draft } });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateEmailAgentDraft = async (req, res) => {
  const updates = {};
  for (const field of ['to', 'subject', 'body']) {
    if (req.body?.[field] !== undefined) {
      if (typeof req.body[field] !== 'string') {
        return res.status(400).json({ success: false, message: `${field} must be text.` });
      }
      updates[field] = req.body[field].trim();
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: 'Provide at least one draft field to update.' });
  }
  if (updates.to !== undefined && updates.to.length > 254) {
    return res.status(400).json({ success: false, message: 'Recipient address is too long.' });
  }
  if (updates.subject !== undefined && updates.subject.length > 150) {
    return res.status(400).json({ success: false, message: 'Subject must be 150 characters or fewer.' });
  }
  if (updates.body !== undefined && (!updates.body || updates.body.length > 20000)) {
    return res.status(400).json({ success: false, message: 'Email body must be 1 to 20,000 characters.' });
  }

  try {
    const draft = await EmailAgentDraft.findOneAndUpdate(
      { _id: req.params.draftId, userId: req.user._id, status: 'pending' },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Pending email draft not found.' });
    }
    return res.json({ success: true, data: { draft } });
  } catch (error) {
    return sendError(res, error);
  }
};

export const sendEmailAgentDraft = async (req, res) => {
  try {
    const draft = await getOwnedPendingDraft(req.params.draftId, req.user._id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Pending email draft not found.' });
    }
    if (!isValidEmailAddress(draft.to)) {
      return res.status(400).json({ success: false, message: 'Enter a valid recipient email address before sending.' });
    }
    if (!draft.subject || !draft.body) {
      return res.status(400).json({ success: false, message: 'Email subject and body are required before sending.' });
    }
    assertEmailSendingConfigured();

    const claimedDraft = await EmailAgentDraft.findOneAndUpdate(
      { _id: draft._id, userId: req.user._id, status: 'pending' },
      { $set: { status: 'sending' } },
      { new: true },
    );
    if (!claimedDraft) {
      return res.status(409).json({ success: false, message: 'This email draft is already being processed.' });
    }

    try {
      const result = await sendApprovedEmail(claimedDraft);
      claimedDraft.status = 'sent';
      claimedDraft.sentAt = new Date();
      await claimedDraft.save();
      return res.json({
        success: true,
        message: 'Email sent successfully.',
        data: { draft: claimedDraft, messageId: result.messageId },
      });
    } catch (error) {
      claimedDraft.status = 'failed';
      await claimedDraft.save();
      return sendError(res, error);
    }
  } catch (error) {
    return sendError(res, error);
  }
};

export const cancelEmailAgentDraft = async (req, res) => {
  try {
    const draft = await EmailAgentDraft.findOneAndUpdate(
      { _id: req.params.draftId, userId: req.user._id, status: 'pending' },
      { $set: { status: 'cancelled' } },
      { new: true },
    );
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Pending email draft not found.' });
    }
    return res.json({ success: true, message: 'Email draft cancelled.', data: { draft } });
  } catch (error) {
    return sendError(res, error);
  }
};
