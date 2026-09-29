import { GoogleGenerativeAI } from '@google/generative-ai';
import SupabaseService from './supabaseService.js';
import getCourseModel from '../models/Course.js';
import getChapterModel from '../models/Chapter.js';
import getLessonModel from '../models/Lesson.js';
import getENoteModel from '../models/ENote.js';

let knowledgeIndex = [];
let lastIndexTime = 0;
const INDEX_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Builds or refreshes the Knowledge Index from the shared database (Courses, Lessons, ENotes)
 */
export const buildKnowledgeIndex = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && knowledgeIndex.length > 0 && now - lastIndexTime < INDEX_CACHE_TTL) {
    return knowledgeIndex;
  }

  try {
    const Course = getCourseModel();
    const Chapter = getChapterModel();
    const Lesson = getLessonModel();
    const ENote = getENoteModel();

    const newIndex = [];

    // 1. Index Courses
    const courses = await Course.find({ isPublished: true }).lean();
    for (const c of courses) {
      const contentText = [
        c.title,
        c.description,
        c.shortDescription,
        (c.whatYouLearn || []).join(' '),
        (c.requirements || []).join(' '),
        (c.tags || []).join(' '),
        `Category: ${c.category}, Level: ${c.level}, Language: ${c.language}`
      ].filter(Boolean).join('. ');

      newIndex.push({
        id: c._id.toString(),
        title: c.title,
        type: 'course',
        category: c.category,
        subject: c.category,
        content: contentText,
        slug: c.slug,
        link: `/courses/${c.slug}`
      });
    }

    // 2. Index Chapters & Lessons
    const lessons = await Lesson.find({}).lean();
    for (const l of lessons) {
      newIndex.push({
        id: l._id.toString(),
        title: `Lesson: ${l.title}`,
        type: 'lesson',
        category: 'Lesson Content',
        subject: 'Course Curriculum',
        content: `Lesson Title: ${l.title}. Type: ${l.type}. Duration: ${l.duration} mins.`,
        link: `/learn/${l.courseId}`
      });
    }

    // 3. Index E-Notes
    const notes = await ENote.find({ isPublished: true }).lean();
    for (const n of notes) {
      const contentText = [
        n.title,
        n.description,
        n.shortDescription,
        `Subject: ${n.subject}`,
        `Class: ${n.class}`,
        `Board: ${n.board}`,
        `Exam: ${n.exam}`,
        `Type: ${n.type}`,
        (n.tags || []).join(' ')
      ].filter(Boolean).join('. ');

      newIndex.push({
        id: n._id.toString(),
        title: n.title,
        type: 'enote',
        category: n.exam || n.subject,
        subject: n.subject,
        content: contentText,
        slug: n.slug,
        link: `/notes/${n.slug}`
      });
    }

    knowledgeIndex = newIndex;
    lastIndexTime = now;
    console.log(`📚 RAG Knowledge Base indexed ${knowledgeIndex.length} educational chunks.`);
    return knowledgeIndex;
  } catch (error) {
    console.error('Error building RAG Knowledge Index:', error.message);
    return knowledgeIndex;
  }
};

/**
 * Retrieves the top-K relevant knowledge chunks for a user query using hybrid Supabase pgvector & keyword scoring
 */
export const retrieveContext = async (query, topK = 4, options = {}) => {
  // 1. Try fetching from Supabase pgvector / note_chunks if query embedding is provided or if Supabase is connected
  if (options.queryEmbedding) {
    try {
      const vectorResults = await SupabaseService.searchNoteChunksVector({
        queryEmbedding: options.queryEmbedding,
        matchThreshold: options.matchThreshold || 0.75,
        matchCount: topK,
        examCode: options.examCode || 'JEE_MAIN'
      });
      if (vectorResults && vectorResults.length > 0) {
        return vectorResults.map(chunk => ({
          id: chunk.id,
          title: chunk.heading_path || 'NotepediaX Verified Note',
          type: 'enote',
          category: options.examCode || 'JEE_MAIN',
          subject: 'Physics/Math/Chemistry',
          content: chunk.content,
          link: `/notes/${chunk.note_id || 'view'}`
        }));
      }
    } catch (supaErr) {
      console.warn('Supabase RAG vector search notice:', supaErr.message);
    }
  }

  // 2. Fallback to indexing and keyword scoring over educational knowledge base
  const index = await buildKnowledgeIndex();
  if (!index || index.length === 0) return [];

  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(k => k.length > 2);

  if (keywords.length === 0) {
    return index.slice(0, topK);
  }

  const scoredDocs = index.map(doc => {
    let score = 0;
    const docTitle = doc.title.toLowerCase();
    const docContent = doc.content.toLowerCase();
    const docSubject = (doc.subject || '').toLowerCase();

    for (const kw of keywords) {
      if (docTitle.includes(kw)) score += 5;
      if (docSubject.includes(kw)) score += 3;
      
      const count = (docContent.match(new RegExp(kw, 'g')) || []).length;
      score += Math.min(count, 5);
    }

    return { ...doc, score };
  });

  // Filter out non-matching docs if there are matches
  const matchingDocs = scoredDocs.filter(d => d.score > 0).sort((a, b) => b.score - a.score);

  if (matchingDocs.length > 0) {
    return matchingDocs.slice(0, topK);
  }

  // Fallback to general docs if no exact keyword match
  return index.slice(0, topK);
};

/**
 * Generates an answer using Google Gemini API with RAG context injection & educational guardrails
 */
export const generateRAGAnswer = async (query, contextDocs, previousMessages = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Build structured context string
  const contextString = contextDocs
    .map((doc, idx) => `[Source ${idx + 1}] Title: ${doc.title} (${doc.type.toUpperCase()})\nContent: ${doc.content}`)
    .join('\n\n');

  const systemInstruction = `You are NotepediaX AI Educational Tutor, an intelligent and friendly educational assistant.
Your sole purpose is to help students learn, understand academic concepts (Physics, Chemistry, Math, Coding, UPSC, Biology, etc.), and find relevant courses and study notes on the NotepediaX platform.

STRICT MANDATORY RULES:
1. FOCUS ONLY ON EDUCATION & LEARNING: If the student asks non-educational questions (e.g. sports, movies, celebrity gossip, personal advice), politely decline and remind them that you are an Educational AI Tutor focused on helping them excel in their studies.
2. USE THE PROVIDED CONTEXT: Ground your answer in the provided NotepediaX Course & Study Note context whenever relevant. Mention course/note titles when applicable.
3. BE CLEAR & STRUCTURED: Use markdown headers, bullet points, and code snippets where appropriate to make explanations easy to understand.
4. BE ENCOURAGING: Keep a supportive tone suitable for students preparing for competitive exams like JEE, NEET, CBSE, UPSC, or Coding interviews.`;

  const prompt = `${systemInstruction}

CONTEXT FROM NOTEPEDIAX DATABASE:
---
${contextString || 'No specific course context found.'}
---

STUDENT QUESTION:
"${query}"

Provide a clear, detailed, and helpful educational response:`;

  // Try calling Gemini API if key is present and not default placeholder
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (responseText) {
        return {
          answer: responseText,
          sources: contextDocs.map(d => ({ title: d.title, type: d.type, link: d.link }))
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local educational response engine:', err.message);
    }
  }

  // Fallback intelligent RAG answer engine if Gemini API key is unavailable or fails
  const topicMatch = contextDocs.length > 0 ? contextDocs[0].title : 'General Academic Concepts';
  const sourceList = contextDocs.map(d => `• **${d.title}** (${d.type.toUpperCase()})`).join('\n');

  const fallbackAnswer = `### 📘 Educational Guide: ${query}

Thank you for asking! Based on NotepediaX study materials for **${topicMatch}**, here is a structured summary:

#### Key Learning Concepts:
1. **Core Fundamentals**: Ensure you review the underlying principles and formulas related to your query.
2. **Exam Application**: Focus on past-year problems, step-by-step derivations, and standard problem-solving shortcuts.
3. **Recommended Study Path**: Review the indexed courses and handwritten notes on NotepediaX to solidify your understanding.

#### Relevant NotepediaX Resources:
${sourceList || '• Explore our Courses and E-Notes section for detailed study guides.'}

> 💡 *Tip: You can enroll in free courses or download formula sheets directly from the NotepediaX portal.*`;

  return {
    answer: fallbackAnswer,
    sources: contextDocs.map(d => ({ title: d.title, type: d.type, link: d.link }))
  };
};
