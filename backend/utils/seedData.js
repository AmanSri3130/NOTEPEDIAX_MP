import dotenv from 'dotenv';
import dns from 'node:dns';
import { getSharedConnection } from '../config/db.js';
import getCourseModel from '../models/Course.js';
import getChapterModel from '../models/Chapter.js';
import getLessonModel from '../models/Lesson.js';
import getENoteModel from '../models/ENote.js';
import getCouponModel from '../models/Coupon.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const seed = async () => {
  try {
    console.log(`Connecting to shared database (notepediax) for seeding...`);
    const conn = getSharedConnection();
    
    // Wait for connection to be ready if needed
    if (conn.readyState !== 1) {
      await new Promise((resolve, reject) => {
        conn.once('connected', resolve);
        conn.once('error', reject);
      });
    }
    console.log(`Connected to shared DB (notepediax).`);

    const Course = getCourseModel();
    const Chapter = getChapterModel();
    const Lesson = getLessonModel();
    const ENote = getENoteModel();
    const Coupon = getCouponModel();

    // Clear existing collections
    await Course.deleteMany({});
    await Chapter.deleteMany({});
    await Lesson.deleteMany({});
    await ENote.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Cleared existing Courses, Chapters, Lessons, E-Notes, and Coupons in notepediax.');

    // 1. Create Courses
    const coursesData = [
      {
        title: 'Organic Chemistry: JEE/NEET Advanced Prep',
        slug: 'organic-chem',
        description: 'Complete organic chemistry course tailored for JEE/NEET Advanced level. Includes reaction mechanisms, substitutions, and eliminations.',
        shortDescription: 'Advanced organic chemistry derivations, mechanisms, and exam solver shortcuts.',
        category: 'JEE',
        level: 'Advanced',
        language: 'Hinglish',
        price: 999,
        mrp: 2499,
        imageInitials: 'OC',
        previewVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        requirements: ['Basic understanding of general chemistry', 'Familiarity with functional groups'],
        whatYouLearn: ['Understand SN1/SN2 and E1/E2 mechanisms', 'Solve complex stereochemistry structures', 'Synthesize organic products step-by-step']
      },
      {
        title: 'Full Stack Web Dev (Vite + React + Node.js)',
        slug: 'web-dev',
        description: 'Learn modern full stack development using Vite, React 18, Tailwind CSS, Express, and MongoDB from scratch.',
        shortDescription: 'Build modern responsive websites and APIs using React, Tailwind, and Node.js.',
        category: 'Coding',
        level: 'Intermediate',
        language: 'English',
        price: 1299,
        mrp: 3999,
        imageInitials: 'WD',
        previewVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        requirements: ['Basic HTML, CSS and JS syntax'],
        whatYouLearn: ['Deploy production MERN apps to Vercel/Railway', 'Build reactive dynamic state layouts', 'Integrate secure JWT and database models']
      },
      {
        title: 'UPSC Mains GS Paper II: Polity & Constitution',
        slug: 'upsc-polity',
        description: 'Comprehensive analysis of Indian constitution, amendments, judicial reviews, and governance guidelines for UPSC mains preparation.',
        shortDescription: 'Mains syllabus study guides covering constitution, governance, and policy analysis.',
        category: 'UPSC',
        level: 'Advanced',
        language: 'Hindi',
        price: 1499,
        mrp: 4500,
        imageInitials: 'UP',
        previewVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        requirements: ['Basic understanding of civics', 'Interest in current affairs'],
        whatYouLearn: ['In-depth knowledge of constitution articles', 'Draft governance policy comparisons', 'Analyze active supreme court cases']
      },
      {
        title: 'Wave Optics & Modern Physics: Boards Special',
        slug: 'physics-optics',
        description: 'Detailed board-level preparations for optics, dual nature of radiation, atom structures, and semiconductor theory.',
        shortDescription: 'Optics derivations, wave patterns, and board exam scoring questions.',
        category: 'Boards',
        level: 'Intermediate',
        language: 'Hinglish',
        price: 799,
        mrp: 1999,
        imageInitials: 'WO',
        previewVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        requirements: ['Basic physics vector mathematics'],
        whatYouLearn: ['Derive wave theory and interference formulas', 'Explain photoelectric effects and atomic orbits', 'Solve Board sample papers with accuracy']
      }
    ];

    const courses = [];
    for (const cData of coursesData) {
      const course = await Course.create(cData);
      courses.push(course);
    }
    console.log(`Created ${courses.length} courses.`);

    // 2. Create Chapters and Lessons for Organic Chemistry Course
    const organicCourse = courses[0];
    
    const chapter1 = await Chapter.create({
      courseId: organicCourse._id,
      title: 'Chapter 1: Stereochemistry & Baselines',
      order: 1
    });

    const lesson1_1 = await Lesson.create({
      chapterId: chapter1._id,
      courseId: organicCourse._id,
      title: 'Introduction to Chiral Centers & Isomers',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 15,
      isFree: true,
      order: 1
    });

    const lesson1_2 = await Lesson.create({
      chapterId: chapter1._id,
      courseId: organicCourse._id,
      title: 'R/S Nomenclature Derivations',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 20,
      isFree: false,
      order: 2
    });

    chapter1.lessons = [lesson1_1._id, lesson1_2._id];
    await chapter1.save();

    const chapter2 = await Chapter.create({
      courseId: organicCourse._id,
      title: 'Chapter 2: Substitution Reactions',
      order: 2
    });

    const lesson2_1 = await Lesson.create({
      chapterId: chapter2._id,
      courseId: organicCourse._id,
      title: 'SN1 Mechanisms and Carbocation Stability',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 25,
      isFree: false,
      order: 1
    });

    const lesson2_2 = await Lesson.create({
      chapterId: chapter2._id,
      courseId: organicCourse._id,
      title: 'SN2 Mechanisms and Inversion Pathways',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 22,
      isFree: false,
      order: 2
    });

    chapter2.lessons = [lesson2_1._id, lesson2_2._id];
    await chapter2.save();

    const chapter3 = await Chapter.create({
      courseId: organicCourse._id,
      title: 'Chapter 3: Elimination Reactions',
      order: 3
    });

    const lesson3_1 = await Lesson.create({
      chapterId: chapter3._id,
      courseId: organicCourse._id,
      title: 'E1 Mechanisms & Saytzeff vs Hofmann Rules',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 30,
      isFree: false,
      order: 1
    });

    const lesson3_2 = await Lesson.create({
      chapterId: chapter3._id,
      courseId: organicCourse._id,
      title: 'E2 Mechanisms & Anti-periplanar Geometries',
      type: 'video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 28,
      isFree: false,
      order: 2
    });

    const lesson3_3 = await Lesson.create({
      chapterId: chapter3._id,
      courseId: organicCourse._id,
      title: 'Live Q&A: Substitution vs Elimination Master Class',
      type: 'live',
      duration: 60,
      isFree: false,
      order: 3
    });

    chapter3.lessons = [lesson3_1._id, lesson3_2._id, lesson3_3._id];
    await chapter3.save();

    organicCourse.chapters = [chapter1._id, chapter2._id, chapter3._id];
    organicCourse.totalLessons = 7;
    organicCourse.totalDuration = 15 + 20 + 25 + 22 + 30 + 28 + 60;
    await organicCourse.save();

    // Create chapters/lessons for other courses
    for (let i = 1; i < courses.length; i++) {
      const c = courses[i];
      const chap = await Chapter.create({
        courseId: c._id,
        title: 'Chapter 1: Getting Started Fundamentals',
        order: 1
      });
      const les1 = await Lesson.create({
        chapterId: chap._id,
        courseId: c._id,
        title: 'Welcome & System Overview',
        type: 'video',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 10,
        isFree: true,
        order: 1
      });
      const les2 = await Lesson.create({
        chapterId: chap._id,
        courseId: c._id,
        title: 'Core Concepts & Paradigms',
        type: 'video',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 25,
        isFree: false,
        order: 2
      });
      chap.lessons = [les1._id, les2._id];
      await chap.save();

      c.chapters = [chap._id];
      c.totalLessons = 2;
      c.totalDuration = 35;
      await c.save();
    }

    console.log('Chapters and Lessons seeded.');

    // 3. Create E-Notes
    const notesData = [
      {
        title: 'Electrostatics & Gauss Theorem Formulae Notes',
        slug: 'electrostatics-gauss-notes',
        description: 'Handwritten formulae derivations and past year CBSE exam questions.',
        subject: 'Physics',
        class: 'Class 12',
        board: 'CBSE',
        exam: 'CBSE',
        type: 'notes',
        language: 'English',
        fileUrl: '/uploads/notes/electrostatics.pdf',
        fileSize: '4.8 MB',
        pageCount: 18,
        price: 0,
        mrp: 99,
        previewPages: ['pg1', 'pg2']
      },
      {
        title: 'Inorganic Chemistry: Coordination Compounds Master Class',
        slug: 'coordination-compounds-notes',
        description: 'Lattice theory, isomerism classifications and ligands series tricks.',
        subject: 'Chemistry',
        class: 'Class 12',
        board: 'JEE',
        exam: 'JEE',
        type: 'notes',
        language: 'Hinglish',
        fileUrl: '/uploads/notes/coordination.pdf',
        fileSize: '6.2 MB',
        pageCount: 24,
        price: 49,
        mrp: 149,
        previewPages: ['pg1', 'pg2']
      },
      {
        title: 'Cell Biology & Plant Physiology Diagrams Sheet',
        slug: 'cell-biology-notes',
        description: 'Coloured handwritten summaries of photosynthesis cycles and organelles.',
        subject: 'Biology',
        class: 'Class 11',
        board: 'NEET',
        exam: 'NEET',
        type: 'notes',
        language: 'English',
        fileUrl: '/uploads/notes/cell_biology.pdf',
        fileSize: '8.4 MB',
        pageCount: 32,
        price: 0,
        mrp: 199,
        previewPages: ['pg1', 'pg2']
      },
      {
        title: 'Calculus: Indefinite Integrals & Solved Examples',
        slug: 'calculus-integrals-notes',
        description: 'Formula lists, substitution proofs and CBSE board scoring sheets.',
        subject: 'Mathematics',
        class: 'Class 12',
        board: 'ICSE',
        exam: 'ICSE',
        type: 'notes',
        language: 'English',
        fileUrl: '/uploads/notes/calculus.pdf',
        fileSize: '3.5 MB',
        pageCount: 12,
        price: 49,
        mrp: 129,
        previewPages: ['pg1', 'pg2']
      }
    ];

    for (const nData of notesData) {
      await ENote.create(nData);
    }
    console.log('Seeded E-Notes store.');

    // 4. Create Coupons
    await Coupon.create({
      code: 'OFF50',
      discountType: 'percent',
      discountValue: 50,
      minOrderValue: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await Coupon.create({
      code: 'FLAT200',
      discountType: 'flat',
      discountValue: 200,
      minOrderValue: 400,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    console.log('Seeded Coupons.');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seed();

