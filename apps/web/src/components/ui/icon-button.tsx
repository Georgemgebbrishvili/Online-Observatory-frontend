import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  children: ReactNode;
  variant?: "default" | "active";
};

export function IconButton({
  className = "",
  children,
  label,
  type = "button",
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`icon-button icon-button-${variant} ${className}`}
      type={type}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
