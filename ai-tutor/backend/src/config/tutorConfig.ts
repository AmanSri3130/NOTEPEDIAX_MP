export const SUBJECT_FAMILIES = {
  STEM: ['maths', 'physics', 'chemistry', 'biology'],
  LANGUAGES: ['english', 'hindi', 'sanskrit'],
  LITERATURE: ['poetry', 'prose', 'drama', 'fiction', 'essay'],
  HUMANITIES: ['history', 'geography', 'polity', 'economics', 'sociology'],
  COMMERCE: ['accountancy', 'business studies', 'economics'],
  COMPUTING: ['programming', 'data structures', 'ai/ml', 'computer science'],
  CURRENT_AFFAIRS: ['general awareness', 'current affairs'],
  REASONING: ['reasoning', 'aptitude']
};

export const UI_MODES = ['Explain', 'Solve', 'Quiz me', 'Revise', 'Mains answer', 'Summarize chapter'];

export const getSubjectFamily = (subject: string): string => {
  const normalized = subject.toLowerCase();
  for (const [family, subjects] of Object.entries(SUBJECT_FAMILIES)) {
    if (subjects.includes(normalized)) {
      return family;
    }
  }
  return 'GENERAL';
};

export const buildSystemPromptForFamily = (family: string, classLevel: string): string => {
  let prompt = `You are the NotepediaX AI Tutor. Adapt your language and depth for a student in ${classLevel}. You must answer ONLY using the provided retrieved context. `;

  switch (family) {
    case 'STEM':
      prompt += `Provide step-by-step worked solutions. DO NOT compute arithmetic yourself; indicate calculations to be done by the calculator tool. Always show units. Include a 'try it yourself' follow-up problem based on retrieved PYQs.`;
      break;
    case 'LANGUAGES':
      prompt += `Explain grammar rules from the material. Generate exercises from retrieved passages. If translating, label it as translation help.`;
      break;
    case 'LITERATURE':
      prompt += `Provide summary, themes, devices, or character analysis strictly from the retrieved text. Quote only short excerpts present in the corpus. Do not invent quotations or critical claims.`;
      break;
    case 'HUMANITIES':
      prompt += `Provide structured notes with dates/names ONLY from context. Maintain a balanced, attributed presentation on contested topics. Use Mains-style structure if requested.`;
      break;
    case 'COMMERCE':
      prompt += `Use formulas and journal entries from material. Do not compute arithmetic yourself, indicate for the calculator tool.`;
      break;
    case 'COMPUTING':
      prompt += `Explain concepts and code from the material. Label any extra suggestion with "General suggestion, not from your material".`;
      break;
    case 'CURRENT_AFFAIRS':
      prompt += `Include date and source. If the chunk is older than 90 days, add a "may be outdated" flag.`;
      break;
    default:
      prompt += `Answer strictly based on the material provided.`;
      break;
  }

  prompt += `\nAlways ask ONE short Socratic check question at the end to verify understanding.`;
  return prompt;
};
