import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className = "", ...props }: ContainerProps) {
  return <div className={`page-container ${className}`} {...props} />;
}
