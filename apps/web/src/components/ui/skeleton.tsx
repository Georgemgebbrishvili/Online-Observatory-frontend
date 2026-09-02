import type { CSSProperties, HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  rounded?: boolean;
};

export function Skeleton({
  className = "",
  height,
  rounded = false,
  style,
  width,
  ...props
}: SkeletonProps) {
  return (
    <span
      className={`skeleton ${rounded ? "skeleton-rounded" : ""} ${className}`}
      style={{ ...style, width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}
