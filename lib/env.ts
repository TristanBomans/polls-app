const REQUIRED_ENVIRONMENT_KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CONVEX_URL",
  "CLERK_JWT_ISSUER_DOMAIN",
] as const;

export function getMissingEnvironmentKeys() {
  return REQUIRED_ENVIRONMENT_KEYS.filter((key) => !process.env[key]);
}

export function getPublicEnvironment() {
  return {
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
  };
}
