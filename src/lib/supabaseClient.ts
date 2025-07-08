// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// PASTIKAN TIDAK ADA `getSecret` DI SINI
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables in supabaseClient.ts.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);