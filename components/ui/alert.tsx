import { type HTMLAttributes, type ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-accent-subtle/50 border-accent-muted text-accent",
  success: "bg-success-subtle border-emerald-200 text-success",
  warning: "bg-warning-subtle border-amber-200 text-amber-800",
  error: "bg-danger-subtle border-red-200 text-danger",
};

const iconMap: Record<AlertVariant, ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export function Alert({
  children,
  variant = "info",
  title,
  className = "",
  ...props
}: AlertProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${variantStyles[variant]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">{iconMap[variant]}</div>
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium">{title}</p>}
          <div className={`text-sm leading-relaxed ${title ? "mt-1" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
