import { CLERK_CONVEX_JWT_TEMPLATE } from "../lib/contracts";

const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

const authConfig = {
  providers: clerkIssuerDomain
    ? [
        {
          domain: clerkIssuerDomain,
          applicationID: CLERK_CONVEX_JWT_TEMPLATE,
        },
      ]
    : [],
};

export default authConfig;
