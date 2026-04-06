"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { VoteForm } from "@/components/forms/vote-form";
import { PollResults } from "@/components/results/poll-results";
import { api } from "@/convex/_generated/api";
import { formatDateTime } from "@/lib/utils";
import { Card, Button, EmptyState, SkeletonCard, Badge } from "@/components/ui";

interface PollDetailScreenProps {
  slug: string;
}

export function PollDetailScreen({ slug }: PollDetailScreenProps) {
  const detail = useQuery(api.polls.getPollBySlug, { slug });
  const [copied, setCopied] = useState(false);

  if (detail === undefined) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (detail === null) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Poll not found"
          description="The poll you're looking for doesn't exist or may have been removed."
          action={{ label: "Browse polls", href: "/" }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Poll
              </span>
              {detail.viewer.isOwner && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-subtle text-accent">
                  Your poll
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
              {detail.poll.question}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Created {formatDateTime(detail.poll.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Updated {formatDateTime(detail.poll.updatedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {detail.poll.totalVoteCount} votes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detail.viewer.canEdit && (
              <Button variant="secondary" size="sm" href={`/poll/${detail.poll.slug}/edit`}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" href="/">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Button>
          </div>
        </div>
      </Card>

      {/* Share link */}
      <Card variant="subtle" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Share this poll</p>
            <p className="text-xs text-text-tertiary">
              Anyone with the link can view and vote
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 sm:flex-none px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary font-mono truncate max-w-[200px] sm:max-w-xs">
            {typeof window !== "undefined" ? window.location.href : `/poll/${slug}`}
          </code>
          <Button
            variant={copied ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            leftIcon={
              copied ? (
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )
            }
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Card>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <VoteForm detail={detail} />

        <div className="space-y-6">
          <PollResults
            title="Results"
            description="Current vote distribution for all active options."
            options={detail.activeOptions}
            totalVoteCount={detail.poll.totalVoteCount}
            emptyMessage="No active options available."
            highlightedOptionId={detail.viewer.currentVoteOptionId}
          />

          {detail.archivedOptions.length > 0 && (
            <PollResults
              title="Archived options"
              description="These options are no longer accepting votes but remain in the results."
              options={detail.archivedOptions}
              totalVoteCount={detail.poll.totalVoteCount}
              emptyMessage="No archived options."
              highlightedOptionId={detail.viewer.currentVoteOptionId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
