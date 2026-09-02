import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  footer?: ReactNode;
  interactive?: boolean;
};

export function Card({
  children,
  className = "",
  eyebrow,
  footer,
  interactive = false,
  title,
  ...props
}: CardProps) {
  return (
    <article
      className={`card ${interactive ? "card-interactive" : ""} ${className}`}
      {...props}
    >
      {(eyebrow || title) && (
        <header className="card-header">
          {eyebrow && <p>{eyebrow}</p>}
          {title && <h3>{title}</h3>}
        </header>
      )}
      <div className="card-content">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </article>
  );
}

type SurfacePanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  elevated?: boolean;
};

export function SurfacePanel({
  children,
  className = "",
  elevated = false,
  ...props
}: SurfacePanelProps) {
  return (
    <div
      className={`surface-panel ${elevated ? "surface-panel-elevated" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
