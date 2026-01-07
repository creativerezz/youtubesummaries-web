"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ClerkAuthButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="h-8">Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
    </>
  );
}


