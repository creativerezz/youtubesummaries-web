"use client";

import dynamic from "next/dynamic";

const ClerkAuthButton = dynamic(
  () =>
    import("@/components/clerk/clerk-auth-button").then(
      (m) => m.ClerkAuthButton
    ),
  { ssr: false }
);

export function AuthButton() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If Clerk isn't configured, don't render auth UI (prevents build/prerender crashes).
  if (!publishableKey) return null;

  return <ClerkAuthButton />;
}
