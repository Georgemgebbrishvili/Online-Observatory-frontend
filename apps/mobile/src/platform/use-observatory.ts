import { platform } from "./api";
import { useResource, type Resource } from "./use-resource";
import type { BookableObservatory } from "@darkview/contracts";

/** The first-party observatory (ADR-003): the one telescope a customer books. */
export function useObservatory(): {
  resource: Resource<BookableObservatory | null>;
  retry: () => void;
} {
  return useResource(
    () =>
      platform
        .observatories()
        .then((list) => list.items.find((item) => item.kind === "FIRST_PARTY") ?? null),
    "observatories",
  );
}
