/**
 * Subject colors, icons, and auto-detection helpers for consistent badging across
 * sidebar history, welcome cards, selectors, and chat bubbles.
 */

export const SUBJECT_META = {
  'Auto-detect': {
    name: 'Auto-detect',
    color: '#818CF8',
    bgLight: 'rgba(99, 102, 241, 0.12)',
    borderLight: 'rgba(99, 102, 241, 0.25)',
    textColor: '#818CF8',
    dotClass: 'bg-indigo-500',
    iconName: 'Sparkles',
  },
  Math: {
    name: 'Math',
    color: '#3B82F6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderLight: 'rgba(59, 130, 246, 0.28)',
    textColor: '#60A5FA',
    dotClass: 'bg-blue-500',
    iconName: 'Divide',
  },
  Physics: {
    name: 'Physics',
    color: '#F97316',
    bgLight: 'rgba(249, 115, 22, 0.12)',
    borderLight: 'rgba(249, 115, 22, 0.28)',
    textColor: '#FB923C',
    dotClass: 'bg-orange-500',
    iconName: 'Atom',
  },
  Chemistry: {
    name: 'Chemistry',
    color: '#22C55E',
    bgLight: 'rgba(34, 197, 94, 0.12)',
    borderLight: 'rgba(34, 197, 94, 0.28)',
    textColor: '#4ADE80',
    dotClass: 'bg-green-500',
    iconName: 'FlaskConical',
  },
  Biology: {
    name: 'Biology',
    color: '#14B8A6',
    bgLight: 'rgba(20, 184, 166, 0.12)',
    borderLight: 'rgba(20, 184, 166, 0.28)',
    textColor: '#2DD4BF',
    dotClass: 'bg-teal-500',
    iconName: 'Dna',
  },
  Coding: {
    name: 'Coding',
    color: '#8B5CF6',
    bgLight: 'rgba(139, 92, 246, 0.12)',
    borderLight: 'rgba(139, 92, 246, 0.28)',
    textColor: '#A78BFA',
    dotClass: 'bg-purple-500',
    iconName: 'Code2',
  },
  Commerce: {
    name: 'Commerce',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    borderLight: 'rgba(245, 158, 11, 0.28)',
    textColor: '#FBBF24',
    dotClass: 'bg-amber-500',
    iconName: 'BarChart3',
  },
  Humanities: {
    name: 'Humanities',
    color: '#F43F5E',
    bgLight: 'rgba(244, 63, 94, 0.12)',
    borderLight: 'rgba(244, 63, 94, 0.28)',
    textColor: '#FB7185',
    dotClass: 'bg-rose-500',
    iconName: 'BookOpen',
  },
  Languages: {
    name: 'Languages',
    color: '#06B6D4',
    bgLight: 'rgba(6, 182, 212, 0.12)',
    borderLight: 'rgba(6, 182, 212, 0.28)',
    textColor: '#22D3EE',
    dotClass: 'bg-cyan-500',
    iconName: 'Languages',
  },
  'Exam Prep': {
    name: 'Exam Prep',
    color: '#6366F1',
    bgLight: 'rgba(99, 102, 241, 0.12)',
    borderLight: 'rgba(99, 102, 241, 0.28)',
    textColor: '#818CF8',
    dotClass: 'bg-indigo-500',
    iconName: 'GraduationCap',
  },
};

/**
 * Infer the academic subject from message text or title if subject is unset or 'Auto-detect'.
 */
export function detectSubject(text = '') {
  const s = text.toLowerCase();
  if (/(derivative|integral|matrix|equation|quadratic|triangle|hypotenuse|probability|algebra|polynomial|calculus|logarithm|sin\(|cos\(|tan\(|\bx\^|2x|solve for)/i.test(s)) {
    return 'Math';
  }
  if (/(velocity|gravity|kinematics|acceleration|force|newton|momentum|resistor|ohm|optics|refraction|lens|quantum|thermodynamics|m\/s|joule|watt)/i.test(s)) {
    return 'Physics';
  }
  if (/(reaction|molarity|periodic|electron|acid|base|ph scale|organic|mole|isotope|covalent|titration|benzene|catalyst)/i.test(s)) {
    return 'Chemistry';
  }
  if (/(mitosis|meiosis|dna|rna|photosynthesis|cell|neuron|organism|ecosystem|enzyme|chromosome|evolution|heart|bacteria)/i.test(s)) {
    return 'Biology';
  }
  if (/(python|javascript|typescript|c\+\+|java\b|react|function|recursion|array|pointer|sql|loop|class\b|algorithm|frontend|backend|api)/i.test(s)) {
    return 'Coding';
  }
  if (/(debit|credit|accounting|ledger|balance sheet|gdp|inflation|elasticity|macroeconomics|microeconomics|shares|dividend|depreciation)/i.test(s)) {
    return 'Commerce';
  }
  if (/(history|geography|constitution|civics|democracy|sociology|philosophy|revolution|monarchy|renaissance)/i.test(s)) {
    return 'Humanities';
  }
  if (/(grammar|vocabulary|metaphor|hinglish|spanish|french|tense|preposition|synonym|antonym|essay)/i.test(s)) {
    return 'Languages';
  }
  return 'General';
}

/**
 * Returns subject metadata (dot color, bg color, name) guaranteed to be valid.
 */
export function getSubjectMeta(subjectName, fallbackText = '') {
  if (subjectName && subjectName !== 'Auto-detect' && SUBJECT_META[subjectName]) {
    return SUBJECT_META[subjectName];
  }
  if (fallbackText) {
    const detected = detectSubject(fallbackText);
    if (SUBJECT_META[detected]) return SUBJECT_META[detected];
  }
  return SUBJECT_META['Auto-detect'];
}
