import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-surface-subtle text-text-secondary border-border",
  accent: "bg-accent-subtle text-accent border-accent-muted",
  success: "bg-success-subtle text-success border-emerald-200",
  warning: "bg-warning-subtle text-amber-700 border-amber-200",
  danger: "bg-danger-subtle text-danger border-red-200",
  muted: "bg-transparent text-text-muted border-transparent",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
