import supabase from './supabase.js';

/**
 * Initializes and verifies Supabase PostgreSQL Database connection on startup
 */
export const connectDB = async () => {
  try {
    const { data, error } = await supabase.from('exams').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      console.warn(`⚡ Supabase Database Connection Warning: ${error.message}`);
    } else {
      console.log('⚡ Supabase PostgreSQL Database initialized and connected successfully!');
    }
  } catch (err) {
    console.error('❌ Supabase initialization error:', err.message);
  }
};

export default connectDB;
