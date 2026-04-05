import {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import Link from "next/link";

type ButtonOwnProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
};

type ButtonProps = ButtonOwnProps &
  (
    | ({ as?: "button" } & ComponentPropsWithoutRef<"button">)
    | ({ as: "a" } & ComponentPropsWithoutRef<"a">)
    | ({ as: typeof Link } & ComponentPropsWithoutRef<typeof Link>)
  );

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover shadow-sm",
  secondary:
    "bg-surface border border-border-strong text-text-primary hover:border-accent hover:text-accent hover:bg-accent-subtle/30 active:bg-accent-subtle/50",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle active:bg-surface-muted",
  danger:
    "bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeStyles = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      as: Component,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    const content = isLoading ? (
      <>
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {children}
      </>
    ) : (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );

    // Render as Link if 'href' is in props
    if (Component === Link || ("href" in props && props.href)) {
      return (
        <Link
          className={combinedClassName}
          {...(props as ComponentPropsWithoutRef<typeof Link>)}
        >
          {content}
        </Link>
      );
    }

    // Render as anchor if 'href' is in props and not Link
    if ("href" in props && typeof props.href === "string") {
      return (
        <a
          className={combinedClassName}
          {...(props as ComponentPropsWithoutRef<"a">)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isLoading || ("disabled" in props && props.disabled)}
        {...(props as ComponentPropsWithoutRef<"button">)}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
