import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sanitize URL: Remove trailing slashes and /rest/v1 if accidentally included
if (supabaseUrl && typeof supabaseUrl === 'string') {
  // Ensure it starts with https://
  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
  supabaseUrl = supabaseUrl.replace(/\/$/, '');
}

export const isSupabaseConfigured = !!(supabaseUrl && !supabaseUrl.includes('placeholder'));

if (!supabaseUrl || (typeof supabaseUrl === 'string' && supabaseUrl.includes('placeholder'))) {
  console.error('Supabase URL is missing or placeholder. Authentication will fail.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
