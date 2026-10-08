import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://uvtjldmfrvjptrdktzzi.supabase.co';

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dGpsZG1mcnZqcHRyZGt0enppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwMjAwMSwiZXhwIjoyMTA2MDc4MDAxfQ.gqroe2iKoGj0un0C4QWO6iM_T7tpWJtSuL6bWrsb-Do';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export default supabase;
