import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Authentication helpers using Clerk
 * 
 * Architecture:
 * - Clerk: Handles authentication (sign-in, sign-up, sessions, user management)
 * - Supabase: Handles database operations (profiles, usage logs, subscriptions)
 * 
 * Clerk user IDs are stored in Supabase tables (e.g., `clerk_user_id` column)
 * to link authenticated users to their data.
 */

// Helper function to get the current session/auth state
export async function getSession() {
  const { userId, sessionId } = await auth();
  if (!userId) return null;
  return { userId, sessionId };
}

// Helper function to get the current user
export async function getUser() {
  const user = await currentUser();
  return user;
}

// Helper to check if user is authenticated
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}
