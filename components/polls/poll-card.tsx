import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import type { PollSummary } from "@/types/polls";
import { Badge } from "@/components/ui";

interface PollCardProps {
  poll: PollSummary;
}

export function PollCard({ poll }: PollCardProps) {
  const timeAgo = formatDistanceToNow(poll.updatedAt);

  return (
    <article className="group rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:border-accent-muted transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-text-primary tracking-tight line-clamp-2 group-hover:text-accent transition-colors duration-150">
            <Link href={`/poll/${poll.slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {poll.question}
            </Link>
          </h2>
        </div>
        {poll.viewerCanEdit && (
          <Badge variant="accent" size="sm">
            Yours
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{poll.activeOptionCount} options</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>
            {poll.totalVoteCount} vote{poll.totalVoteCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-text-muted">Updated {timeAgo}</span>
        {poll.viewerHasVoted ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Voted
          </span>
        ) : (
          <span className="text-xs text-text-tertiary">Open to vote</span>
        )}
      </div>
    </article>
  );
}
