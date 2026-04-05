import { formatPercentage } from "@/lib/utils";
import type { PollResultOption } from "@/types/polls";
import { Card, Badge } from "@/components/ui";

interface PollResultsProps {
  title: string;
  description: string;
  options: PollResultOption[];
  totalVoteCount: number;
  emptyMessage: string;
  highlightedOptionId?: string | null;
}

export function PollResults({
  title,
  description,
  options,
  totalVoteCount,
  emptyMessage,
  highlightedOptionId,
}: PollResultsProps) {
  const maxVotes = Math.max(...options.map((o) => o.voteCount), 0);

  return (
    <Card>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <Badge variant="muted">{totalVoteCount} total votes</Badge>
        </div>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>

      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-6 text-center">
          <p className="text-sm text-text-tertiary">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const isHighlighted = highlightedOptionId === option.id;
            const isLeading = option.voteCount === maxVotes && option.voteCount > 0;
            const percentage = totalVoteCount > 0 ? option.votePercentage : 0;

            return (
              <div
                key={option.id}
                className={`relative rounded-xl border p-4 transition-colors ${
                  isHighlighted
                    ? "border-accent bg-accent-subtle/30"
                    : "border-border bg-surface-subtle"
                }`}
              >
                {/* Bar background */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isHighlighted ? "bg-accent/5" : "bg-surface"
                    }`}
                    style={{
                      width: `${Math.max(percentage, isHighlighted ? 2 : 0)}%`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary truncate">
                        {option.label}
                      </span>
                      {isLeading && (
                        <Badge variant="success" size="sm">
                          Leading
                        </Badge>
                      )}
                      {option.isArchived && (
                        <Badge variant="muted" size="sm">
                          Archived
                        </Badge>
                      )}
                      {isHighlighted && (
                        <Badge variant="accent" size="sm">
                          Your vote
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-text-primary">
                      {option.voteCount}
                    </span>
                    <span className="text-sm text-text-tertiary w-10 text-right">
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative mt-3 h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isHighlighted ? "bg-accent" : "bg-text-tertiary"
                    }`}
                    style={{
                      width: `${Math.max(percentage, option.voteCount > 0 ? 2 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
