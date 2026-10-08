import { LearnerMastery } from '../models/LearnerMastery';

/**
 * SuperMemo-2 (SM-2) style simplified spaced repetition calculation
 */
const calculateNextReview = (masteryScore: number, isCorrect: boolean): Date => {
  const now = new Date();
  let daysToAdd = 1;

  if (isCorrect) {
    if (masteryScore > 0.8) daysToAdd = 14;
    else if (masteryScore > 0.5) daysToAdd = 7;
    else daysToAdd = 3;
  } else {
    daysToAdd = 1; // Needs review immediately tomorrow
  }

  now.setDate(now.getDate() + daysToAdd);
  return now;
};

export const updateLearnerMastery = async (userId: string, taxonomyId: string, isCorrect: boolean) => {
  const mastery = await LearnerMastery.findOne({ userId, taxonomyId });

  if (!mastery) {
    const nextReview = calculateNextReview(0, isCorrect);
    await LearnerMastery.create({
      userId,
      taxonomyId,
      attempts: 1,
      correct: isCorrect ? 1 : 0,
      masteryScore: isCorrect ? 0.2 : 0, // initial bump
      lastSeenAt: new Date(),
      nextReviewAt: nextReview
    });
    return;
  }

  mastery.attempts += 1;
  if (isCorrect) mastery.correct += 1;

  // Exponential moving average for mastery score
  const newScore = isCorrect ? Math.min(1, mastery.masteryScore + 0.1) : Math.max(0, mastery.masteryScore - 0.2);

  mastery.masteryScore = newScore;
  mastery.lastSeenAt = new Date();
  mastery.nextReviewAt = calculateNextReview(newScore, isCorrect);

  await mastery.save();
};

export const getDueReviews = async (userId: string) => {
  return await LearnerMastery.find({
    userId,
    nextReviewAt: { $lte: new Date() }
  }).sort({ nextReviewAt: 1 }).limit(5).populate('taxonomyId');
};
