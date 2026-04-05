import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"]),

  polls: defineTable({
    slug: v.string(),
    question: v.string(),
    creatorId: v.string(),
    activeOptionCount: v.number(),
    totalVoteCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_creatorId", ["creatorId"]),

  pollOptions: defineTable({
    pollId: v.id("polls"),
    label: v.string(),
    order: v.number(),
    isArchived: v.boolean(),
    voteCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_pollId", ["pollId"])
    .index("by_pollId_isArchived_order", ["pollId", "isArchived", "order"]),

  votes: defineTable({
    pollId: v.id("polls"),
    optionId: v.id("pollOptions"),
    voterId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pollId", ["pollId"])
    .index("by_pollId_optionId", ["pollId", "optionId"])
    .index("by_pollId_voterId", ["pollId", "voterId"])
    .index("by_voterId_pollId", ["voterId", "pollId"]),
});
