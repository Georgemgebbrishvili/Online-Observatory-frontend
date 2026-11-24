import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

type AuthPageProps = {
  title: string;
  /** Only where the words tell the visitor what to do next, such as checking their email. */
  description?: string;
  children: ReactNode;
};

/** ADR-102: a large graduated ring behind the card, as round an eyepiece. Decoration only. */
function Ring() {
  return (
    <svg className="auth-ring" viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="96" />
      <circle className="auth-ring-inner" r="70" />
      {Array.from({ length: 120 }, (_, index) => (
        <line
          key={index}
          y1="-96"
          y2={index % 10 === 0 ? -86 : index % 5 === 0 ? -90 : -93}
          transform={`rotate(${index * 3})`}
        />
      ))}
    </svg>
  );
}

export function AuthPage({ children, description, title }: AuthPageProps) {
  return (
    <main className="auth-page" id="main-content">
      <Ring />
      <Container className="auth-layout">
        <h1 className="visually-hidden">{title}</h1>
        <section className="auth-panel">
          {description && <p className="auth-message">{description}</p>}
          {children}
        </section>
      </Container>
    </main>
  );
}
