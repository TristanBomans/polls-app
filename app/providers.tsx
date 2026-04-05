"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useMutation, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  clerkPublishableKey: string;
  convexUrl: string;
}

export function Providers({
  children,
  clerkPublishableKey,
  convexUrl,
}: ProvidersProps) {
  const [convex] = useState(() => new ConvexReactClient(convexUrl.trim()));

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthenticatedUserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function AuthenticatedUserSync() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const syncUser = useMutation(api.polls.syncUser);
  const lastSyncedSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !sessionId) {
      lastSyncedSessionId.current = null;
      return;
    }

    if (lastSyncedSessionId.current === sessionId) {
      return;
    }

    lastSyncedSessionId.current = sessionId;
    void syncUser().catch((error) => {
      console.error("Failed to sync the current Clerk user into Convex.", error);
    });
  }, [isLoaded, isSignedIn, sessionId, syncUser]);

  return null;
}
