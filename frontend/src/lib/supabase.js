import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hhstcwiifurczvytolnj.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TR4tFNCVyVaubp5efP0J7A_19zmjoCM';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export default supabase;
