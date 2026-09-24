import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  /** How many placeholder lines to draw. */
  lines?: number;
  /** What is loading, read once by a screen reader. */
  label: string;
};

/**
 * A whole surface that is loading, built from the `Skeleton` primitive.
 *
 * `Skeleton` is one decorative bar and is `aria-hidden`; a page made only of those is
 * silence to a screen reader. This wraps them in a polite live region so the wait is
 * announced, and is what a route's `loading.tsx` should render.
 */
export function LoadingState({ label, lines = 3 }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-busy="true">
      <span className="visually-hidden">{label}</span>
      <Skeleton height="1.75rem" width="42%" rounded />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}
