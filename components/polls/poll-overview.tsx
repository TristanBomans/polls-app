"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PollCard } from "./poll-card";
import { SkeletonCard, EmptyState, PageHeader, Button } from "@/components/ui";

function PollGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function PollOverview() {
  const polls = useQuery(api.polls.listPolls, {});

  if (polls === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          label="Polls"
          title="Browse polls"
          description="Explore polls created by the community and cast your vote."
        />
        <PollGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Polls"
        title="Browse polls"
        description="Explore polls created by the community and cast your vote."
        action={
          <Button href="/new">Create poll</Button>
        }
      />

      {polls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            title="No polls yet"
            description="Be the first to create a poll and start collecting votes from your community."
            action={{ label: "Create a poll", href: "/new" }}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
