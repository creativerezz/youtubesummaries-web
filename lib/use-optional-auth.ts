"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";

/**
 * A wrapper around Clerk's useAuth that gracefully handles missing Clerk configuration.
 * Returns a default unauthenticated state if Clerk isn't configured.
 */
export function useOptionalAuth() {
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If Clerk isn't configured, return default unauthenticated state
  if (!isClerkConfigured) {
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: () => false,
      signOut: async () => {},
      getToken: async () => null,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkAuth();
}
