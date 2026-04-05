const REQUIRED_ENVIRONMENT_KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CONVEX_URL",
  "CLERK_JWT_ISSUER_DOMAIN",
] as const;

function getTrimmedEnvironmentValue(key: string) {
  return process.env[key]?.trim() ?? "";
}

function isAbsoluteHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function getMissingEnvironmentKeys() {
  return REQUIRED_ENVIRONMENT_KEYS.filter((key) => {
    const value = getTrimmedEnvironmentValue(key);

    if (!value) {
      return true;
    }

    if (key === "NEXT_PUBLIC_CONVEX_URL" || key === "CLERK_JWT_ISSUER_DOMAIN") {
      return !isAbsoluteHttpUrl(value);
    }

    return false;
  });
}

export function getPublicEnvironment() {
  return {
    clerkPublishableKey: getTrimmedEnvironmentValue(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    ),
    convexUrl: getTrimmedEnvironmentValue("NEXT_PUBLIC_CONVEX_URL"),
  };
}
