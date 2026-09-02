import type { HTMLAttributes, ReactNode } from "react";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  selected?: boolean;
};

export function Chip({
  children,
  className = "",
  selected = false,
  ...props
}: ChipProps) {
  return (
    <span className={`chip ${selected ? "chip-selected" : ""} ${className}`} {...props}>
      {children}
    </span>
  );
}
