"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
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
  const { isLoaded: isUserLoaded, user } = useUser();
  const syncUser = useMutation(api.polls.syncUser);
  const lastSyncedProfileKey = useRef<string | null>(null);

  const profileKey = [
    sessionId ?? "",
    user?.fullName ?? "",
    user?.firstName ?? "",
    user?.lastName ?? "",
    user?.username ?? "",
    user?.primaryEmailAddress?.emailAddress ?? "",
    user?.imageUrl ?? "",
  ].join("|");

  useEffect(() => {
    if (!isLoaded || !isUserLoaded) {
      return;
    }

    if (!isSignedIn || !sessionId) {
      lastSyncedProfileKey.current = null;
      return;
    }

    if (lastSyncedProfileKey.current === profileKey) {
      return;
    }

    lastSyncedProfileKey.current = profileKey;
    const profile = buildUserProfile(user);
    void syncUser(profile ? { profile } : {}).catch((error) => {
      console.error("Failed to sync the current Clerk user into Convex.", error);
    });
  }, [isLoaded, isSignedIn, isUserLoaded, sessionId, profileKey, syncUser, user]);

  return null;
}

function buildUserProfile(user: ReturnType<typeof useUser>["user"]) {
  if (!user) {
    return undefined;
  }

  return {
    name: user.fullName ?? undefined,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    username: user.username ?? undefined,
    email: user.primaryEmailAddress?.emailAddress ?? undefined,
    imageUrl: user.imageUrl ?? undefined,
  };
}
