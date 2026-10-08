import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Chapter from '../models/Chapter.js';
import Lesson from '../models/Lesson.js';
import ENote from '../models/ENote.js';

dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

const courseDefinitions = [
  {
    demoKey: 'demo-jee-organic-chemistry',
    title: '[DEMO] JEE Organic Chemistry Foundations',
    category: 'JEE',
    level: 'Beginner',
    language: 'English',
    imageInitials: 'OC',
    requirements: ['No prerequisites; this is sample catalog content.'],
    whatYouLearn: ['Identify basic organic chemistry concepts.', 'Review sample reaction terminology.'],
    chapters: [
      {
        title: '[DEMO] Organic Chemistry Basics',
        lessons: ['[DEMO] Introduction to Organic Chemistry', '[DEMO] Functional Groups Overview', '[DEMO] Sample Molecule Recognition'],
      },
      {
        title: '[DEMO] Reaction Concepts',
        lessons: ['[DEMO] Reaction Mechanism Vocabulary', '[DEMO] Sample Reaction Review'],
      },
    ],
  },
  {
    demoKey: 'demo-neet-cell-biology',
    title: '[DEMO] NEET Cell Biology Essentials',
    category: 'NEET',
    level: 'Beginner',
    language: 'English',
    imageInitials: 'CB',
    requirements: ['No prerequisites; this is sample catalog content.'],
    whatYouLearn: ['Recognize common cell structures.', 'Review sample cell biology terminology.'],
    chapters: [
      {
        title: '[DEMO] Cell Structure',
        lessons: ['[DEMO] Cell Components Overview', '[DEMO] Organelles Sample Review'],
      },
      {
        title: '[DEMO] Cell Processes',
        lessons: ['[DEMO] Membrane Transport Vocabulary', '[DEMO] Sample Cell Process Recap'],
      },
    ],
  },
  {
    demoKey: 'demo-board-wave-physics',
    title: '[DEMO] Board Physics: Waves and Optics',
    category: 'Boards',
    level: 'Beginner',
    language: 'English',
    imageInitials: 'WO',
    requirements: ['No prerequisites; this is sample catalog content.'],
    whatYouLearn: ['Review sample wave terminology.', 'Identify basic optics concepts.'],
    chapters: [
      {
        title: '[DEMO] Waves and Optics',
        lessons: ['[DEMO] Wave Properties Sample', '[DEMO] Reflection and Refraction Overview'],
      },
    ],
  },
  {
    demoKey: 'demo-coding-react',
    title: '[DEMO] Coding: React Fundamentals',
    category: 'Coding',
    level: 'Beginner',
    language: 'English',
    imageInitials: 'RC',
    requirements: ['No prerequisites; this is sample catalog content.'],
    whatYouLearn: ['Recognize React component terminology.', 'Review a sample interface structure.'],
    chapters: [
      {
        title: '[DEMO] React Basics',
        lessons: ['[DEMO] Components and Props', '[DEMO] Sample State Concepts'],
      },
    ],
  },
];

const noteDefinitions = [
  {
    demoKey: 'demo-notes-physics-electrostatics',
    title: '[DEMO] Physics: Electrostatics Quick Review',
    subject: 'Physics',
    class: 'Class 12',
    board: 'CBSE',
    exam: 'CBSE',
    description: 'Clearly labeled demo catalog entry. No downloadable study file is included.',
  },
  {
    demoKey: 'demo-notes-chemistry-coordination',
    title: '[DEMO] Chemistry: Coordination Compounds Overview',
    subject: 'Chemistry',
    class: 'Class 12',
    board: 'JEE',
    exam: 'JEE',
    description: 'Clearly labeled demo catalog entry. No downloadable study file is included.',
  },
  {
    demoKey: 'demo-notes-biology-cell',
    title: '[DEMO] Biology: Cell Structure Recap',
    subject: 'Biology',
    class: 'Class 11',
    board: 'NEET',
    exam: 'NEET',
    description: 'Clearly labeled demo catalog entry. No downloadable study file is included.',
  },
  {
    demoKey: 'demo-notes-mathematics-calculus',
    title: '[DEMO] Mathematics: Calculus Formula Review',
    subject: 'Mathematics',
    class: 'Class 12',
    board: 'ICSE',
    exam: 'ICSE',
    description: 'Clearly labeled demo catalog entry. No downloadable study file is included.',
  },
];

const addIfMissing = async (model, demoKey, document) => {
  const existing = await model.findOne({ demoKey }).lean();
  if (existing) {
    if (!existing.isDemo) throw new Error(`Refusing to reuse non-demo catalog record: ${demoKey}`);
    return { document: existing, inserted: false };
  }
  const created = await model.create({ ...document, demoKey, isDemo: true });
  return { document: created, inserted: true };
};

const seedDemoCatalog = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const inserted = { courses: 0, chapters: 0, lessons: 0, notes: 0 };
  for (const definition of courseDefinitions) {
    const { chapters: chapterDefinitions, ...courseFields } = definition;
    const courseData = {
      ...courseFields,
      slug: definition.demoKey,
      description: 'DEMO CONTENT ONLY. This free sample is not an official or paid course.',
      shortDescription: 'Free demo catalog sample; not an official course.',
      instructor: { name: 'Demo content only; no instructor assigned.' },
      price: 0,
      mrp: 0,
      rating: { average: 0, count: 0 },
      enrolledCount: 0,
      totalLessons: 0,
      totalDuration: 0,
      isPublished: true,
      chapters: [],
    };
    const courseResult = await addIfMissing(Course.model, definition.demoKey, courseData);
    const course = courseResult.document;
    if (courseResult.inserted) inserted.courses += 1;

    const chapterIds = [];
    let totalLessons = 0;
    let totalDuration = 0;
    for (let chapterIndex = 0; chapterIndex < chapterDefinitions.length; chapterIndex += 1) {
      const chapterDefinition = chapterDefinitions[chapterIndex];
      const chapterKey = `${definition.demoKey}-chapter-${chapterIndex + 1}`;
      const chapterResult = await addIfMissing(Chapter.model, chapterKey, {
        courseId: course._id,
        title: chapterDefinition.title,
        order: chapterIndex + 1,
        lessons: [],
      });
      const chapter = chapterResult.document;
      if (chapterResult.inserted) inserted.chapters += 1;

      const lessonIds = [];
      for (let lessonIndex = 0; lessonIndex < chapterDefinition.lessons.length; lessonIndex += 1) {
        const lessonKey = `${chapterKey}-lesson-${lessonIndex + 1}`;
        const duration = 5;
        const lessonResult = await addIfMissing(Lesson.model, lessonKey, {
          chapterId: chapter._id,
          courseId: course._id,
          title: chapterDefinition.lessons[lessonIndex],
          type: 'video',
          duration,
          order: lessonIndex + 1,
          isFree: true,
          demoDescription: 'Text-only demo lesson; no lecture video is included.',
        });
        if (lessonResult.inserted) inserted.lessons += 1;
        lessonIds.push(lessonResult.document._id);
        totalLessons += 1;
        totalDuration += duration;
      }

      if (chapter.lessons.length === 0 && lessonIds.length > 0) {
        chapter.lessons = lessonIds;
        await chapter.save();
      }
      chapterIds.push(chapter._id);
    }

    if (course.chapters.length === 0 && chapterIds.length > 0) {
      course.chapters = chapterIds;
      course.totalLessons = totalLessons;
      course.totalDuration = totalDuration;
      await course.save();
    }
  }

  for (const definition of noteDefinitions) {
    const { inserted: wasInserted } = await addIfMissing(ENote.model, definition.demoKey, {
      ...definition,
      slug: definition.demoKey,
      type: 'notes',
      language: 'English',
      price: 0,
      mrp: 0,
    });
    if (wasInserted) inserted.notes += 1;
  }

  const total = Object.values(inserted).reduce((sum, count) => sum + count, 0);
  console.log(`Inserted ${total} demo catalog documents: ${JSON.stringify(inserted)}`);
};

try {
  await seedDemoCatalog();
} catch (error) {
  console.error(`Demo catalog seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
