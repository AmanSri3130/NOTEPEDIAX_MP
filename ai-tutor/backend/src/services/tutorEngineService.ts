import { getSubjectFamily, buildSystemPromptForFamily } from '../config/tutorConfig';

// Mock DB for Hint Ladder state (would be stored in MongoDB in production)
const hintLadderState = new Map<string, number>(); // key: userId_questionId, value: hintLevel (0, 1, 2)

export const processHintLadder = (userId: string, questionId: string): string => {
  const key = `${userId}_${questionId}`;
  const currentLevel = hintLadderState.get(key) || 0;

  let hintResponse = '';
  if (currentLevel === 0) {
    hintResponse = `Hint 1: Look at the retrieved formulas. Which one connects velocity and time?`;
    hintLadderState.set(key, 1);
  } else if (currentLevel === 1) {
    hintResponse = `Hint 2: The formula is d = v * t. Try plugging in 20 and 10.`;
    hintLadderState.set(key, 2);
  } else {
    hintResponse = `Full Solution: Since d = v * t, plugging in the values gives d = 20 m/s * 10 s = 200 meters.`;
    // reset or mark as completed
    hintLadderState.delete(key);
  }

  return hintResponse;
};

export const generateSocraticCheck = (context: any[]): string => {
  return "Check Question: Based on the text, what is the definition of velocity?";
};

export const evaluateSocraticCheck = (studentAnswer: string, context: any[]): boolean => {
  // Cheap LLM pass to evaluate answer correctness against context
  // Mock logic:
  return studentAnswer.toLowerCase().includes('rate');
};

export const buildTutorPrompt = (query: string, subject: string, classLevel: string, context: any[], mode: string): string => {
  const family = getSubjectFamily(subject);
  let systemPrompt = buildSystemPromptForFamily(family, classLevel);

  if (mode === 'Quiz me') {
    systemPrompt += `\nMode: Quiz. Generate questions strictly from the retrieved chunks.`;
  } else if (mode === 'Solve') {
    systemPrompt += `\nMode: Solve. Provide the step-by-step solution.`;
  } else if (mode === 'Mains answer') {
    systemPrompt += `\nMode: Mains answer. Structure with Intro, Body, Conclusion.`;
  }

  return systemPrompt;
};
