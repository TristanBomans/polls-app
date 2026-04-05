import { type ReactNode } from "react";
import { Badge } from "./badge";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: Parameters<typeof Badge>[0]["variant"];
  };
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  label,
  title,
  description,
  badge,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {(label || badge) && (
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {label}
            </span>
          )}
          {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
