"use client";

import { useQuery } from "convex/react";
import { PollForm } from "@/components/forms/poll-form";
import { api } from "@/convex/_generated/api";
import { Card, Button, EmptyState, SkeletonCard, PageHeader } from "@/components/ui";

interface PollEditScreenProps {
  slug: string;
}

export function PollEditScreen({ slug }: PollEditScreenProps) {
  const detail = useQuery(api.polls.getPollBySlug, { slug });

  if (detail === undefined) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
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

  if (!detail.viewer.canEdit) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
          title="Access denied"
          description="Only the poll creator can edit this poll. You can still view the public poll page."
          action={{ label: "View poll", href: `/poll/${detail.poll.slug}` }}
          secondaryAction={{ label: "Browse polls", href: "/" }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Edit poll"
        title="Edit your poll"
        description="Update the question and options. Options with existing votes cannot be renamed but can be archived by removing them."
        action={
          <Button variant="ghost" size="sm" href={`/poll/${detail.poll.slug}`}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to poll
          </Button>
        }
      />

      <PollForm mode="edit" detail={detail} />
    </div>
  );
}
