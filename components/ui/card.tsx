import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default:
    "bg-surface border border-border shadow-sm",
  elevated:
    "bg-surface border border-border shadow-md",
  subtle:
    "bg-surface-subtle border border-border-subtle",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-4 ${className}`}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between gap-4 pt-5 mt-5 border-t border-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";
