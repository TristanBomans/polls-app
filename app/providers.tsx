"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useState } from "react";

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
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
