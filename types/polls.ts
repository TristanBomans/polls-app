import type { Id } from "../convex/_generated/dataModel";

export interface PollSummary {
  id: Id<"polls">;
  slug: string;
  question: string;
  creatorId: string;
  activeOptionCount: number;
  totalVoteCount: number;
  createdAt: number;
  updatedAt: number;
  viewerHasVoted: boolean;
  viewerCanEdit: boolean;
}

export interface VoteInfo {
  voterId: string;
  votedAt: number;
}

export interface PollResultOption {
  id: Id<"pollOptions">;
  label: string;
  order: number;
  voteCount: number;
  votePercentage: number;
  isArchived: boolean;
  hasVotes: boolean;
  voters?: VoteInfo[];
}

export interface PollViewerState {
  isAuthenticated: boolean;
  isOwner: boolean;
  canEdit: boolean;
  canVote: boolean;
  currentVoteOptionId: Id<"pollOptions"> | null;
}

export interface PollDetail {
  poll: PollSummary & {
    archivedOptionCount: number;
  };
  activeOptions: PollResultOption[];
  archivedOptions: PollResultOption[];
  viewer: PollViewerState;
}

export interface PollResults {
  pollId: Id<"polls">;
  slug: string;
  question: string;
  totalVoteCount: number;
  updatedAt: number;
  activeOptions: PollResultOption[];
  archivedOptions: PollResultOption[];
}

export interface PollOptionInput {
  id?: Id<"pollOptions">;
  label: string;
}

export interface CreatePollInput {
  question: string;
  options: PollOptionInput[];
}

export interface UpdatePollInput extends CreatePollInput {
  slug: string;
}

export interface PollMutationResult {
  pollId: Id<"polls">;
  slug: string;
}
