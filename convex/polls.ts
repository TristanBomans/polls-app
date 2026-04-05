import { ConvexError, v } from "convex/values";
import {
  CLERK_CONVEX_JWT_TEMPLATE,
  createSlugBase,
  validatePollInput,
} from "../lib/contracts";
import type {
  PollDetail,
  PollMutationResult,
  PollResults,
  PollSummary,
  VoteInfo,
} from "../types/polls";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

const optionInputValidator = v.object({
  id: v.optional(v.id("pollOptions")),
  label: v.string(),
});

type DataCtx = QueryCtx | MutationCtx;

type PreparedOptionInput = {
  id?: Id<"pollOptions">;
  label: string;
};

function sanitizeQuestion(question: string) {
  return question.replace(/\s+/g, " ").trim();
}

function sanitizeOptionLabel(label: string) {
  return label.replace(/\s+/g, " ").trim();
}

function firstValidationError(question: string, options: PreparedOptionInput[]) {
  const errors = validatePollInput({ question, options });
  return errors[0] ?? null;
}

async function requireViewerId(ctx: DataCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("You must be signed in to perform this action.");
  }

  return identity.subject;
}

async function getViewerId(ctx: DataCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

async function syncCurrentUser(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("You must be signed in.");
  }

  const clerkId = identity.subject;
  const name = identity.name ?? identity.email ?? "Anonymous";
  const email = identity.email;
  const imageUrl = identity.pictureUrl;

  // Check if user exists
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();

  const now = Date.now();

  if (existingUser) {
    // Update last seen and possibly other info
    await ctx.db.patch(existingUser._id, {
      lastSeenAt: now,
      ...(name !== existingUser.name && { name }),
      ...(email !== existingUser.email && { email }),
      ...(imageUrl !== existingUser.imageUrl && { imageUrl }),
    });
    return { ...existingUser, lastSeenAt: now, name, email, imageUrl };
  }

  // Create new user
  const userId = await ctx.db.insert("users", {
    clerkId,
    name,
    email,
    imageUrl,
    lastSeenAt: now,
  });

  return {
    _id: userId,
    _creationTime: now,
    clerkId,
    name,
    email,
    imageUrl,
    lastSeenAt: now,
  };
}

async function getUsersForVotes(
  ctx: DataCtx,
  votes: Doc<"votes">[]
): Promise<Map<string, Doc<"users">>> {
  const userIds = [...new Set(votes.map((v) => v.voterId))];
  const users = await Promise.all(
    userIds.map(async (clerkId) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();
      return user ? ([clerkId, user] as const) : null;
    })
  );

  return new Map(users.filter(Boolean) as [string, Doc<"users">][]);
}

async function getPollBySlugOrThrow(ctx: DataCtx, slug: string) {
  const poll = await ctx.db
    .query("polls")
    .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", slug))
    .unique();

  if (!poll) {
    throw new ConvexError("Poll not found.");
  }

  return poll;
}

async function createUniqueSlug(ctx: MutationCtx, question: string) {
  const baseSlug = createSlugBase(question);
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? baseSlug : `${baseSlug}-${counter + 1}`;
    const existingPoll = await ctx.db
      .query("polls")
      .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", candidate))
      .unique();

    if (!existingPoll) {
      return candidate;
    }

    counter += 1;
  }
}

async function getAllOptionsForPoll(ctx: DataCtx, pollId: Id<"polls">) {
  const options = await ctx.db
    .query("pollOptions")
    .withIndex("by_pollId", (queryBuilder) => queryBuilder.eq("pollId", pollId))
    .collect();

  return options.sort((left, right) => left.order - right.order);
}

async function getViewerVote(
  ctx: DataCtx,
  pollId: Id<"polls">,
  viewerId: string | null,
) {
  if (!viewerId) {
    return null;
  }

  return ctx.db
    .query("votes")
    .withIndex("by_pollId_voterId", (queryBuilder) =>
      queryBuilder.eq("pollId", pollId).eq("voterId", viewerId),
    )
    .unique();
}

async function getVotesForPoll(
  ctx: DataCtx,
  pollId: Id<"polls">,
): Promise<Map<string, VoteInfo[]>> {
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_pollId", (queryBuilder) => queryBuilder.eq("pollId", pollId))
    .collect();

  // Get all users who voted
  const usersMap = await getUsersForVotes(ctx, votes);

  // Group votes by optionId
  const votesByOptionId = new Map<string, VoteInfo[]>();
  for (const vote of votes) {
    const optionId = String(vote.optionId);
    const optionVotes = votesByOptionId.get(optionId) || [];
    const user = usersMap.get(vote.voterId);
    optionVotes.push({
      voterId: vote.voterId,
      voterName: user?.name ?? "Anonymous",
      voterImage: user?.imageUrl,
      votedAt: vote.createdAt,
    });
    votesByOptionId.set(optionId, optionVotes);
  }

  return votesByOptionId;
}

function mapOptionToResult(
  option: Doc<"pollOptions">,
  totalVoteCount: number,
  votesByOptionId: Map<string, VoteInfo[]>,
) {
  const votePercentage =
    totalVoteCount === 0 ? 0 : (option.voteCount / totalVoteCount) * 100;
  const voters = votesByOptionId.get(String(option._id)) || [];

  return {
    id: option._id,
    label: option.label,
    order: option.order,
    voteCount: option.voteCount,
    votePercentage,
    isArchived: option.isArchived,
    hasVotes: option.voteCount > 0,
    voters: voters.sort((a, b) => b.votedAt - a.votedAt),
  };
}

async function buildPollResults(
  ctx: DataCtx,
  poll: Doc<"polls">,
): Promise<PollResults> {
  const options = await getAllOptionsForPoll(ctx, poll._id);
  const activeOptions = options.filter((option) => !option.isArchived);
  const archivedOptions = options.filter((option) => option.isArchived);
  const votesByOptionId = await getVotesForPoll(ctx, poll._id);

  return {
    pollId: poll._id,
    slug: poll.slug,
    question: poll.question,
    totalVoteCount: poll.totalVoteCount,
    updatedAt: poll.updatedAt,
    activeOptions: activeOptions.map((option) =>
      mapOptionToResult(option, poll.totalVoteCount, votesByOptionId),
    ),
    archivedOptions: archivedOptions.map((option) =>
      mapOptionToResult(option, poll.totalVoteCount, votesByOptionId),
    ),
  };
}

async function buildPollDetail(
  ctx: DataCtx,
  poll: Doc<"polls">,
): Promise<PollDetail> {
  const viewerId = await getViewerId(ctx);
  const results = await buildPollResults(ctx, poll);
  const viewerVote = await getViewerVote(ctx, poll._id, viewerId);

  return {
    poll: {
      id: poll._id,
      slug: poll.slug,
      question: poll.question,
      creatorId: poll.creatorId,
      activeOptionCount: poll.activeOptionCount,
      totalVoteCount: poll.totalVoteCount,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      archivedOptionCount: results.archivedOptions.length,
      viewerHasVoted: viewerVote !== null,
      viewerCanEdit: viewerId === poll.creatorId,
    },
    activeOptions: results.activeOptions,
    archivedOptions: results.archivedOptions,
    viewer: {
      isAuthenticated: viewerId !== null,
      isOwner: viewerId === poll.creatorId,
      canEdit: viewerId === poll.creatorId,
      canVote: viewerId !== null && results.activeOptions.length > 0,
      currentVoteOptionId: viewerVote?.optionId ?? null,
    },
  };
}

function ensureValidDraft(question: string, options: PreparedOptionInput[]) {
  const validationError = firstValidationError(question, options);

  if (validationError) {
    throw new ConvexError(validationError);
  }
}

export const listPolls = query({
  args: {},
  handler: async (ctx): Promise<PollSummary[]> => {
    const viewerId = await getViewerId(ctx);
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    const viewerVotes = viewerId
      ? await ctx.db
          .query("votes")
          .withIndex("by_voterId_pollId", (queryBuilder) =>
            queryBuilder.eq("voterId", viewerId),
          )
          .collect()
      : [];

    const votedPollIds = new Set(viewerVotes.map((vote) => String(vote.pollId)));

    return polls.map((poll) => ({
      id: poll._id,
      slug: poll.slug,
      question: poll.question,
      creatorId: poll.creatorId,
      activeOptionCount: poll.activeOptionCount,
      totalVoteCount: poll.totalVoteCount,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      viewerHasVoted: votedPollIds.has(String(poll._id)),
      viewerCanEdit: viewerId === poll.creatorId,
    }));
  },
});

export const getPollBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<PollDetail | null> => {
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", args.slug))
      .unique();

    if (!poll) {
      return null;
    }

    return buildPollDetail(ctx, poll);
  },
});

export const getPollResults = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<PollResults | null> => {
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", args.slug))
      .unique();

    if (!poll) {
      return null;
    }

    return buildPollResults(ctx, poll);
  },
});

export const createPoll = mutation({
  args: {
    question: v.string(),
    options: v.array(optionInputValidator),
  },
  handler: async (ctx, args): Promise<PollMutationResult> => {
    void CLERK_CONVEX_JWT_TEMPLATE;

    // Sync user profile before creating poll
    await syncCurrentUser(ctx);

    const creatorId = await requireViewerId(ctx);
    const question = sanitizeQuestion(args.question);
    const options = args.options.map((option) => ({
      label: sanitizeOptionLabel(option.label),
    }));

    ensureValidDraft(question, options);

    const now = Date.now();
    const slug = await createUniqueSlug(ctx, question);
    const pollId = await ctx.db.insert("polls", {
      slug,
      question,
      creatorId,
      activeOptionCount: options.length,
      totalVoteCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    for (const [order, option] of options.entries()) {
      await ctx.db.insert("pollOptions", {
        pollId,
        label: option.label,
        order,
        isArchived: false,
        voteCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      pollId,
      slug,
    };
  },
});

export const updatePoll = mutation({
  args: {
    slug: v.string(),
    question: v.string(),
    options: v.array(optionInputValidator),
  },
  handler: async (ctx, args): Promise<PollMutationResult> => {
    const viewerId = await requireViewerId(ctx);
    const poll = await getPollBySlugOrThrow(ctx, args.slug);

    if (poll.creatorId !== viewerId) {
      throw new ConvexError("Only the poll creator can edit this poll.");
    }

    const question = sanitizeQuestion(args.question);
    const options = args.options.map((option) => ({
      id: option.id,
      label: sanitizeOptionLabel(option.label),
    }));

    ensureValidDraft(question, options);

    const existingOptions = await getAllOptionsForPoll(ctx, poll._id);
    const activeOptions = existingOptions.filter((option) => !option.isArchived);
    const activeOptionMap = new Map(activeOptions.map((option) => [option._id, option]));
    const submittedIds = options
      .map((option) => option.id)
      .filter((optionId): optionId is Id<"pollOptions"> => optionId !== undefined);

    if (new Set(submittedIds.map(String)).size !== submittedIds.length) {
      throw new ConvexError("Each option can only be submitted once.");
    }

    for (const optionId of submittedIds) {
      if (!activeOptionMap.has(optionId)) {
        throw new ConvexError(
          "Submitted options must belong to the current active poll options.",
        );
      }
    }

    const now = Date.now();
    const retainedOptionIds = new Set<string>();

    for (const [order, option] of options.entries()) {
      if (option.id) {
        const existingOption = activeOptionMap.get(option.id)!;

        if (
          existingOption.voteCount > 0 &&
          existingOption.label !== option.label
        ) {
          throw new ConvexError(
            "Options with existing votes cannot be renamed. Remove them to archive them instead.",
          );
        }

        await ctx.db.patch(existingOption._id, {
          label: option.label,
          order,
          updatedAt: now,
        });

        retainedOptionIds.add(String(existingOption._id));
      } else {
        const optionId = await ctx.db.insert("pollOptions", {
          pollId: poll._id,
          label: option.label,
          order,
          isArchived: false,
          voteCount: 0,
          createdAt: now,
          updatedAt: now,
        });

        retainedOptionIds.add(String(optionId));
      }
    }

    for (const existingOption of activeOptions) {
      if (retainedOptionIds.has(String(existingOption._id))) {
        continue;
      }

      if (existingOption.voteCount > 0) {
        await ctx.db.patch(existingOption._id, {
          isArchived: true,
          archivedAt: now,
          updatedAt: now,
        });
      } else {
        await ctx.db.delete(existingOption._id);
      }
    }

    await ctx.db.patch(poll._id, {
      question,
      activeOptionCount: options.length,
      updatedAt: now,
    });

    return {
      pollId: poll._id,
      slug: poll.slug,
    };
  },
});

export const debugGetUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await syncCurrentUser(ctx);
  },
});

export const submitVote = mutation({
  args: {
    slug: v.string(),
    optionId: v.id("pollOptions"),
  },
  handler: async (ctx, args): Promise<PollMutationResult> => {
    // Sync user profile before voting
    await syncCurrentUser(ctx);

    const viewerId = await requireViewerId(ctx);
    const poll = await getPollBySlugOrThrow(ctx, args.slug);
    const selectedOption = await ctx.db.get(args.optionId);

    if (
      !selectedOption ||
      selectedOption.pollId !== poll._id ||
      selectedOption.isArchived
    ) {
      throw new ConvexError("You can only vote for an active option on this poll.");
    }

    const now = Date.now();
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_pollId_voterId", (queryBuilder) =>
        queryBuilder.eq("pollId", poll._id).eq("voterId", viewerId),
      )
      .unique();

    if (!existingVote) {
      await ctx.db.insert("votes", {
        pollId: poll._id,
        optionId: selectedOption._id,
        voterId: viewerId,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(selectedOption._id, {
        voteCount: selectedOption.voteCount + 1,
        updatedAt: now,
      });

      await ctx.db.patch(poll._id, {
        totalVoteCount: poll.totalVoteCount + 1,
        updatedAt: now,
      });

      return {
        pollId: poll._id,
        slug: poll.slug,
      };
    }

    if (existingVote.optionId === selectedOption._id) {
      await ctx.db.patch(existingVote._id, {
        updatedAt: now,
      });

      await ctx.db.patch(poll._id, {
        updatedAt: now,
      });

      return {
        pollId: poll._id,
        slug: poll.slug,
      };
    }

    const previousOption = await ctx.db.get(existingVote.optionId);

    if (previousOption) {
      await ctx.db.patch(previousOption._id, {
        voteCount: Math.max(0, previousOption.voteCount - 1),
        updatedAt: now,
      });
    }

    await ctx.db.patch(selectedOption._id, {
      voteCount: selectedOption.voteCount + 1,
      updatedAt: now,
    });

    await ctx.db.patch(existingVote._id, {
      optionId: selectedOption._id,
      updatedAt: now,
    });

    await ctx.db.patch(poll._id, {
      updatedAt: now,
    });

    return {
      pollId: poll._id,
      slug: poll.slug,
    };
  },
});
