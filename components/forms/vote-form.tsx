"use client";

import { useMutation } from "convex/react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { PollDetail } from "@/types/polls";
import { Card, Button, Alert, Badge } from "@/components/ui";

interface VoteFormProps {
  detail: PollDetail;
}

export function VoteForm({ detail }: VoteFormProps) {
  const submitVote = useMutation(api.polls.submitVote);
  const [selectedOptionId, setSelectedOptionId] = useState<
    Id<"pollOptions"> | null
  >(detail.viewer.currentVoteOptionId ?? detail.activeOptions[0]?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(detail.viewer.currentVoteOptionId !== null);

  useEffect(() => {
    setSelectedOptionId(
      detail.viewer.currentVoteOptionId ?? detail.activeOptions[0]?.id ?? null,
    );
    setHasVoted(detail.viewer.currentVoteOptionId !== null);
    setSubmitError(null);
  }, [detail.activeOptions, detail.viewer.currentVoteOptionId]);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOptionId) {
      setSubmitError("Please select an option before voting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitVote({
        slug: detail.poll.slug,
        optionId: selectedOptionId,
      });
      setHasVoted(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOptionId, detail.poll.slug, submitVote]);

  if (!detail.viewer.isAuthenticated) {
    return (
      <Card variant="subtle" className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-subtle text-accent mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">
          Sign in to vote
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          You need to be signed in to cast your vote. Creating an account is quick and free.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-in">Sign in</Button>
          <Button variant="secondary" href="/sign-up">Create account</Button>
        </div>
      </Card>
    );
  }

  if (detail.activeOptions.length === 0) {
    return (
      <Card variant="subtle">
        <Alert variant="warning">
          No active options are currently available for voting on this poll.
        </Alert>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {hasVoted ? "Change your vote" : "Cast your vote"}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Select an option and submit your vote. You can change it anytime.
          </p>
        </div>
        {hasVoted && (
          <Badge variant="success" size="md">
            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Voted
          </Badge>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {detail.activeOptions.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCurrentVote = detail.viewer.currentVoteOptionId === option.id;

          return (
            <label
              key={option.id}
              className={`relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-150 ${
                isSelected
                  ? "border-accent bg-accent-subtle/50 shadow-sm"
                  : "border-border bg-surface hover:border-accent-muted hover:bg-surface-subtle"
              }`}
            >
              <input
                type="radio"
                name="voteOption"
                value={option.id}
                checked={isSelected}
                onChange={() => setSelectedOptionId(option.id)}
                className="sr-only"
              />
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-border-strong bg-surface"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-medium ${isSelected ? "text-accent" : "text-text-primary"}`}>
                    {option.label}
                  </span>
                  {isCurrentVote && (
                    <Badge variant="accent" size="sm">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {option.voteCount} vote{option.voteCount === 1 ? "" : "s"}
                </p>
              </div>
            </label>
          );
        })}

        {submitError && (
          <Alert variant="error" className="mt-4">
            {submitError}
          </Alert>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={selectedOptionId === null}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? "Saving..."
              : hasVoted
                ? "Update vote"
                : "Submit vote"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
