import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className = "",
  children,
  disabled,
  loading = false,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size} ${className}`}
      disabled={disabled || loading}
      type={type}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="button-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  children,
  className = "",
  size = "medium",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a className={`button button-${variant} button-${size} ${className}`} {...props}>
      <span>{children}</span>
    </a>
  );
}
