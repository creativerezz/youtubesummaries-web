import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client helpers for database operations
 * 
 * Architecture:
 * - Clerk: Handles authentication (sign-in, sign-up, sessions)
 * - Supabase: Handles database operations (profiles, usage_logs, subscriptions)
 * 
 * Clerk user IDs are stored in Supabase tables (e.g., `clerk_user_id` column)
 * to link authenticated users to their data.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a mock client that will fail gracefully when used
    // This allows the app to build and run even without Supabase configured
    return createClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createClient(url, anonKey);
}

// Admin client for server-side operations that need to bypass RLS
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Return a mock client that will fail gracefully when used
    // This allows the app to build and run even without Supabase configured
    return createClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createClient(url, serviceKey);
}
