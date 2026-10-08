import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Taxonomy } from './models/Taxonomy';
import { RagChunk } from './models/RagChunk';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is required.');

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Taxonomy.deleteMany({});
    await RagChunk.deleteMany({});

    console.log('Cleared existing collections');

    // Create Taxonomy Nodes
    const physicsNode = await Taxonomy.create({
      stage: 'School',
      boardOrExam: 'CBSE',
      classOrLevel: 'Class 11',
      subject: 'Physics',
      chapter: 'Kinematics',
      topic: 'Motion in a Straight Line',
      tags: ['JEE Main', 'NEET']
    });

    const literatureNode = await Taxonomy.create({
      stage: 'School',
      boardOrExam: 'CBSE',
      classOrLevel: 'Class 10',
      subject: 'English',
      chapter: 'First Flight',
      topic: 'A Letter to God',
      tags: []
    });

    console.log('Created Taxonomy Nodes');

    // Create RagChunks
    await RagChunk.create({
      taxonomyIds: [physicsNode._id],
      exam: ['CBSE', 'JEE Main'],
      classLevel: 'Class 11',
      subject: 'Physics',
      topic: 'Motion in a Straight Line',
      contentType: 'theory',
      difficulty: 3,
      language: 'en',
      source: 'NCERT Physics Class 11',
      licenseOk: true,
      metadataPrefix: 'Subject: Physics, Class 11. Topic: Kinematics - Motion in a Straight Line.',
      content: 'Kinematics is the branch of mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause them to move.',
      // Mock embedding array of size 768
      embedding: Array(768).fill(0.01)
    });

    await RagChunk.create({
      taxonomyIds: [literatureNode._id],
      exam: ['CBSE'],
      classLevel: 'Class 10',
      subject: 'English',
      topic: 'A Letter to God',
      contentType: 'prose',
      difficulty: 2,
      language: 'en',
      source: 'NCERT First Flight Class 10',
      licenseOk: true,
      metadataPrefix: 'Subject: English, Class 10. Topic: A Letter to God by G.L. Fuentes.',
      content: 'The house — the only one in the entire valley — sat on the crest of a low hill. From this height one could see the river and the field of ripe corn dotted with the flowers that always promised a good harvest.',
      // Mock embedding
      embedding: Array(768).fill(0.02)
    });

    console.log('Created RagChunks');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
