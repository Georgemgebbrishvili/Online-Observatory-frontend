import { describeShellContract } from "./shell-contract";

// Public routes plus the authenticated application shell. The admin console needs the
// operator role and has its own projects; /sign-in and /register redirect an
// authenticated visitor away, so they live in shell-signed-out.spec.ts.
// Dynamic routes arrive with Phase 2, when their fixtures are wired to real data.
describeShellContract([
  "",
  "pricing",
  "network",
  "observatory",
  "status",
  "terms",
  "privacy",
  "refunds",
  "design-system",
  "app",
  "app/missions",
  "app/live",
  "app/collection",
  "app/profile",
]);
