import { notFound } from "next/navigation";

// An address under a language that matches no route. Without this, Next answers with
// its own unstyled page, outside the layout; through here it gets ours.
export default function MissingPage() {
  notFound();
}
