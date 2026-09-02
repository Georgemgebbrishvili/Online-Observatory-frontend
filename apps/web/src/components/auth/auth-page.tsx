import type { ReactNode } from "react";

import { OpticalRing } from "@/components/astronomy/optical-ring";
import { Container } from "@/components/ui/container";

type AuthPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  securityNote: string;
  children: ReactNode;
};

export function AuthPage({
  children,
  description,
  eyebrow,
  securityNote,
  title,
}: AuthPageProps) {
  return (
    <main className="auth-page" id="main-content">
      <Container className="auth-layout">
        <section className="auth-introduction">
          <p className="eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="auth-optics" aria-hidden="true">
            <OpticalRing active size="large" />
          </div>
        </section>
        <section className="auth-panel">
          {children}
          <p className="auth-security-note">{securityNote}</p>
        </section>
      </Container>
    </main>
  );
}
