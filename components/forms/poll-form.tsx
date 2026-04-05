"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import {
  MAX_POLL_OPTIONS,
  MIN_POLL_OPTIONS,
  validatePollInput,
} from "@/lib/contracts";
import { getErrorMessage } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { PollDetail } from "@/types/polls";
import {
  Card,
  Button,
  Textarea,
  Input,
  Alert,
  Badge,
} from "@/components/ui";

type PollFormMode = "create" | "edit";

type DraftOption = {
  localId: string;
  id?: Id<"pollOptions">;
  label: string;
  hasVotes: boolean;
  voteCount: number;
};

interface PollFormProps {
  mode: PollFormMode;
  detail?: PollDetail;
}

function createLocalId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
}

function createDraftOption(overrides?: Partial<DraftOption>): DraftOption {
  return {
    localId: createLocalId(),
    label: "",
    hasVotes: false,
    voteCount: 0,
    ...overrides,
  };
}

function createEmptyDraftOptions() {
  return Array.from({ length: MIN_POLL_OPTIONS }, () => createDraftOption());
}

function createDraftOptionsFromDetail(detail: PollDetail) {
  return detail.activeOptions.map((option) =>
    createDraftOption({
      id: option.id,
      label: option.label,
      hasVotes: option.hasVotes,
      voteCount: option.voteCount,
    }),
  );
}

export function PollForm({ mode, detail }: PollFormProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createPoll = useMutation(api.polls.createPoll);
  const updatePoll = useMutation(api.polls.updatePoll);

  const [question, setQuestion] = useState(detail?.poll.question ?? "");
  const [options, setOptions] = useState<DraftOption[]>(
    detail ? createDraftOptionsFromDetail(detail) : createEmptyDraftOptions(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (mode === "edit" && detail) {
      setQuestion(detail.poll.question);
      setOptions(createDraftOptionsFromDetail(detail));
      setSubmitError(null);
      setTouched(false);
    }
  }, [detail, mode]);

  const validationErrors = useMemo(
    () =>
      touched
        ? validatePollInput({
            question,
            options: options.map(({ id, label }) => ({ id, label })),
          })
        : [],
    [options, question, touched],
  );

  const archivedOptions = detail?.archivedOptions ?? [];

  const updateOption = useCallback(
    (localId: string, updater: (option: DraftOption) => DraftOption) => {
      setOptions((currentOptions) =>
        currentOptions.map((option) =>
          option.localId === localId ? updater(option) : option,
        ),
      );
    },
    [],
  );

  const addOption = useCallback(() => {
    setOptions((currentOptions) =>
      currentOptions.length >= MAX_POLL_OPTIONS
        ? currentOptions
        : [...currentOptions, createDraftOption()],
    );
    setTouched(true);
  }, []);

  const removeOption = useCallback(
    (localId: string) => {
      setOptions((currentOptions) => {
        if (currentOptions.length <= MIN_POLL_OPTIONS) {
          return currentOptions;
        }
        return currentOptions.filter((option) => option.localId !== localId);
      });
      setTouched(true);
    },
    [],
  );

  if (!isLoaded || isLoading) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Checking authentication...
          </h2>
          <p className="text-sm text-text-secondary">
            Waiting for Clerk and Convex to finish syncing the current session.
          </p>
        </div>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Sign in to create polls
          </h2>
          <p className="text-sm text-text-secondary">
            Creating polls requires a Clerk session that Convex can validate.
            If you just enabled the Convex integration in Clerk, sign out and
            sign back in so the new token is minted.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button as={Link} href="/sign-in" variant="primary">
              Sign in
            </Button>
            <Button as={Link} href="/sign-up" variant="secondary">
              Sign up
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Je bent ingelogd, maar Convex is nog niet gekoppeld
          </h2>
          <p className="text-sm text-text-secondary">
            Clerk ziet je sessie wel, maar Convex ontvangt nog geen geldig
            auth-token voor mutaties. Dit is meestal een Clerk-configuratie of
            sessie-refresh probleem.
          </p>
          <div className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">
              Controleer dit exact:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>De Convex integration staat actief in Clerk.</li>
              <li>
                Je Clerk Frontend API URL matcht
                <code className="mx-1 rounded bg-surface px-1.5 py-0.5 text-xs font-mono">
                  CLERK_JWT_ISSUER_DOMAIN
                </code>
                .
              </li>
              <li>Je logt volledig uit en daarna opnieuw in.</li>
            </ol>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button as={Link} href="/" variant="secondary">
              Terug naar overzicht
            </Button>
            <Button as={Link} href="/sign-in" variant="ghost">
              Opnieuw aanmelden
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (validationErrors.length > 0) {
      setSubmitError(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        question,
        options: options.map(({ id, label }) => (id ? { id, label } : { label })),
      };

      const result =
        mode === "create"
          ? await createPoll(payload)
          : await updatePoll({
              slug: detail!.poll.slug,
              ...payload,
            });

      router.push(`/poll/${result.slug}`);
      router.refresh();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6"
    >
      {/* Question */}
      <Card>
        <Textarea
          label="Question"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setTouched(true);
          }}
          placeholder="What would you like to ask?"
          rows={3}
          error={
            touched && question.trim().length === 0
              ? "Question is required"
              : undefined
          }
        />
        <p className="mt-2 text-xs text-text-muted">
          {question.length}/160 characters
        </p>
      </Card>

      {/* Options */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Answer options
            </h3>
            <p className="text-xs text-text-tertiary">
              Add {MIN_POLL_OPTIONS} to {MAX_POLL_OPTIONS} options for people to choose from
            </p>
          </div>
          <Badge variant="default">
            {options.length}/{MAX_POLL_OPTIONS}
          </Badge>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={option.localId}
              className={`rounded-xl border p-3 transition-colors duration-150 ${
                option.hasVotes
                  ? "bg-surface-subtle border-border"
                  : "bg-surface border-border-strong"
              }`}
            >
              <div className="flex items-start gap-3"

              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-surface-subtle text-xs font-medium text-text-tertiary mt-0.5"
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0"
                >
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      updateOption(option.localId, (currentOption) => ({
                        ...currentOption,
                        label: e.target.value,
                      }))
                    }
                    disabled={option.hasVotes}
                    placeholder={`Option ${index + 1}`}
                    className="h-10"
                  />
                  {option.hasVotes && (
                    <p className="mt-2 text-xs text-text-tertiary flex items-center gap-1.5"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      This option has {option.voteCount} vote
                      {option.voteCount === 1 ? "" : "s"} and cannot be renamed.
                      Remove it to archive.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.localId)}
                  disabled={options.length <= MIN_POLL_OPTIONS}
                  className="flex-shrink-0 mt-0.5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {options.length < MAX_POLL_OPTIONS && (
          <Button
            type="button"
            variant="secondary"
            onClick={addOption}
            className="w-full mt-4"
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Add option
          </Button>
        )}
      </Card>

      {/* Archived options info */}
      {archivedOptions.length > 0 && (
        <Alert variant="info" title="Archived options"
        >
          {archivedOptions.length} option
          {archivedOptions.length === 1 ? "" : "s"} with votes have been archived
          and will still appear in results, but can&apos;t receive new votes.
        </Alert>
      )}

      {/* Errors */}
      {validationErrors.length > 0 && touched && (
        <Alert variant="warning" title="Please fix the following issues:"
        >
          <ul className="list-disc list-inside space-y-1"
          >
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {submitError && <Alert variant="error"
      >{submitError}</Alert>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2"
      >
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={validationErrors.length > 0 && touched}
          size="lg"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create poll"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
