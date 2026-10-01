import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Frontend Supabase client (singleton).
// Uses the Vite-public anon key on purpose: the anon/publishable key is
// designed to be embedded in client bundles and is protected by RLS/policies,
// never by secrecy. Service-role keys must never be used here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return (
    trimmed.length === 0 ||
    trimmed.includes('placeholder') ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('example')
  );
}

// True when both env vars are present and look real. When false, all
// visit-counter global helpers fall back to the local cache and never throw.
export function isSupabaseConfigured(): boolean {
  return !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);
}

// Singleton client. Created with empty strings when unconfigured so module
// import never throws; every helper checks isSupabaseConfigured() first and
// bails to the local fallback before touching the network.
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);
