# Polls App

Production-oriented polling app foundation built in `apps/polls-app` with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Convex
- Clerk authentication
- OpenNext Cloudflare adapter
- Wrangler for Cloudflare Workers deployment

The goal of this repository slice is a clean, deployable foundation with stable backend contracts and route boundaries. The UI is intentionally minimal so a frontend-focused pass can refine presentation without rewriting core logic.

## Product Scope

Current functionality:

- Public poll overview at `/`
- Authenticated poll creation at `/new`
- Public poll detail at `/poll/[slug]`
- Owner-only poll editing at `/poll/[slug]/edit`
- Clerk sign-in at `/sign-in`
- Clerk sign-up at `/sign-up`
- Authenticated voting with one active vote per Clerk user per poll
- Vote updates and vote switching

## Voting Model Decision

This foundation uses authenticated voting with Clerk identity.

Why:

- It keeps create, edit, and vote permissions on one identity model.
- Backend enforcement is simpler and clearer than a browser-generated anonymous participant ID.
- It avoids extra anti-abuse and duplicate-vote heuristics in v1.

## Permissions Model

Enforced in Convex backend mutations:

- Unauthenticated users cannot create polls.
- Unauthenticated users cannot edit polls.
- Only the creator can edit a poll.
- Unauthenticated users cannot vote.
- One active vote per authenticated user per poll is enforced by the `votes` table and backend mutation flow.

Public access:

- Anyone can list polls.
- Anyone can view poll detail and results.

## Edit Behavior and Vote Integrity

Poll editing preserves vote integrity with the following rules:

- Poll questions can be updated by the poll owner.
- Active options with no votes can be renamed or removed.
- Active options with votes cannot be renamed.
- If an option with votes is removed from the edit form, it is archived instead of deleted.
- Archived options remain visible in poll results, but they no longer accept new votes.
- Poll slugs stay stable after creation, even if the question changes.

This keeps shared poll URLs stable and prevents historical votes from being silently reassigned to a changed label.

## Directory Structure

Key directories:

- `app/`: Next.js App Router routes and providers
- `components/layout/`: shell and header
- `components/polls/`: overview, detail, and edit screens
- `components/forms/`: create/edit form and vote form
- `components/results/`: poll result rendering
- `convex/`: schema, auth config, backend queries, backend mutations
- `lib/`: env helpers, shared validation/contracts, formatting helpers
- `types/`: shared frontend/backend TypeScript contracts
- `public/`: static assets and Cloudflare headers

## Important Contracts

Primary shared types live in:

- `types/polls.ts`
- `lib/contracts.ts`

Important backend entry points live in:

- `convex/polls.ts`

Implemented Convex functions:

- `listPolls`
- `getPollBySlug`
- `getPollResults`
- `createPoll`
- `updatePoll`
- `submitVote`

## Local Setup

Prerequisites:

- Node.js 22+
- npm 10+
- Clerk account
- Convex account
- Cloudflare account

Install dependencies:

```bash
npm install
```

Create local environment files:

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
```

Generate Convex types:

```bash
npm run convex:codegen
```

Start Convex in one terminal:

```bash
npm run convex:dev
```

Start Next.js in a second terminal:

```bash
npm run dev
```

## Environment Variables

Required app variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `NEXT_PUBLIC_CONVEX_URL`

Recommended Clerk routing variables:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`

For Cloudflare local preview, mirror the needed runtime values in `.dev.vars`.

## Convex Setup

1. Create or connect a Convex project.
2. Run `npm run convex:dev` and follow the CLI setup flow.
3. Commit the generated files in `convex/_generated/`.
4. Ensure `NEXT_PUBLIC_CONVEX_URL` points at your configured Convex deployment.

Convex schema tables:

- `polls`
- `pollOptions`
- `votes`

Denormalized counters:

- `polls.activeOptionCount`
- `polls.totalVoteCount`
- `pollOptions.voteCount`

These counters keep the overview and results queries straightforward for the frontend pass.

## Clerk Setup

1. Create a Clerk application.
2. Copy the Clerk publishable key and secret key into `.env.local`.
3. Set Clerk paths:
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`
4. Enable the sign-in/sign-up methods described below.

### Google OAuth Setup

1. In Clerk, enable the Google social connection.
2. Configure the Google OAuth credentials requested by Clerk.
3. Add the callback URLs Clerk shows in its dashboard to the Google Cloud OAuth client.

### Email/Password Setup

1. In Clerk, enable email address authentication.
2. Enable password sign-in and password-based sign-up.
3. Configure email verification behavior according to your environment requirements.

## Convex + Clerk Auth Integration

This app uses Clerk's Convex integration.

Steps:

1. In Clerk, activate the Convex integration for the application.
2. Use the Clerk Frontend API URL as `CLERK_JWT_ISSUER_DOMAIN`.
3. Keep `convex/auth.config.ts` aligned with that issuer and the `convex` application ID.
4. After enabling the integration, sign out and sign back in so the browser session picks up the new Convex token.

The app uses `ConvexProviderWithClerk`, so Convex requests are authenticated with Clerk-issued tokens and backend permissions are enforced from `ctx.auth`.

## Commands

Local development:

```bash
npm run dev
npm run convex:dev
```

Code generation and validation:

```bash
npm run convex:codegen
npm run lint
npm run typecheck
npm run build
```

Cloudflare preview and deploy:

```bash
npm run preview
npm run deploy
```

Wrangler typing:

```bash
npm run cf-typegen
```

## Cloudflare / Wrangler Deployment

This app uses the current Cloudflare-compatible Next.js approach:

- `@opennextjs/cloudflare`
- `wrangler.jsonc`
- `open-next.config.ts`

Deployment flow:

1. Configure the required environment variables in Cloudflare.
2. Build and preview locally with `npm run preview`.
3. Deploy with `npm run deploy`.

Notes:

- The app is currently designed around dynamic Convex-backed routes, so no extra ISR cache layer is configured yet.
- The generated OpenNext self-service binding remains in `wrangler.jsonc` for Cloudflare compatibility.
- If a later frontend pass introduces tag revalidation or ISR-heavy behavior, add the recommended OpenNext cache bindings at that point instead of partially wiring them now.

## Frontend Handoff Notes

Main routes:

- `/`
- `/new`
- `/poll/[slug]`
- `/poll/[slug]/edit`
- `/sign-in`
- `/sign-up`

What the next frontend agent can safely change:

- Visual design
- Layout composition
- Component styling
- Interaction polish
- Loading states
- Empty states
- Copywriting

What should not be changed without good reason:

- Convex table model and vote invariants
- Route paths and slug behavior
- Authenticated voting model
- Option archival behavior for voted options
- Shared contracts in `types/polls.ts` without corresponding backend updates

Recommended boundaries to preserve:

- `components/layout/*`
- `components/polls/*`
- `components/forms/*`
- `components/results/*`

## Limitations

Current v1 limitations:

- No pagination on the overview yet
- No poll deletion flow yet
- No optimistic UI or toast system
- No moderation / abuse prevention layer
- No organization or team ownership model
- No analytics or audit trail beyond timestamps and vote ownership

These are intentional omissions in this foundation pass.
