import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

type AuthPageProps = {
  title: string;
  /** Only where the words tell the visitor what to do next, such as checking their email. */
  description?: string;
  children: ReactNode;
};

export function AuthPage({ children, description, title }: AuthPageProps) {
  return (
    <main className="auth-page" id="main-content">
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
