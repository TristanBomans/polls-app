import { type ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16">
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-subtle text-accent mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-text-secondary max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action &&
            (action.href ? (
              <Button href={action.href}>{action.label}</Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button variant="secondary" href={secondaryAction.href}>
                {secondaryAction.label}
              </Button>
            ) : (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
