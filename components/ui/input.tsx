import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, helperText, error, className = "", disabled, ...props },
    ref,
  ) => {
    const baseStyles =
      "w-full h-11 px-4 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted transition-all duration-150";

    const stateStyles = error
      ? "border-danger bg-danger-subtle/30 focus:border-danger focus:ring-2 focus:ring-danger/20"
      : "border-border-strong hover:border-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20";

    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed bg-surface-subtle"
      : "";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
          disabled={disabled}
          {...props}
        />
        {(helperText || error) && (
          <p
            className={`mt-1.5 text-sm ${error ? "text-danger" : "text-text-tertiary"}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
