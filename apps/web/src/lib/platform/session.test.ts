import { describe, expect, it, vi } from "vitest";

const platformRequest = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() =>
  vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
);

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./client", async () => {
  const actual = await vi.importActual<typeof import("./client")>("./client");
  return { platformRequest, PlatformError: actual.PlatformError };
});

const { getCurrentUser, requireOperator, requireUser } = await import("./session");

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "observer@darkview.test",
  displayName: "Observer",
  role: "USER",
  locale: "en",
  createdAt: "2026-09-01T00:00:00.000Z",
};

describe("session", () => {
  it("returns the signed-in user", async () => {
    platformRequest.mockResolvedValue(user);

    expect(await getCurrentUser()).toMatchObject({ email: "observer@darkview.test" });
  });

  it("treats an unreachable platform as signed out rather than throwing", async () => {
    // Rethrowing here served a 500 on /sign-in, /register, /app and every /admin
    // route whenever the API was down.
    platformRequest.mockRejectedValue(new Error("connect ECONNREFUSED"));

    expect(await getCurrentUser()).toBeNull();
  });

  it("treats a payload that fails contract validation as signed out", async () => {
    platformRequest.mockResolvedValue({ ...user, role: "SUPERUSER" });

    expect(await getCurrentUser()).toBeNull();
  });

  it("sends an unauthenticated visitor to sign-in, never past it", async () => {
    platformRequest.mockRejectedValue(new Error("platform down"));

    await expect(requireUser("en")).rejects.toThrow("REDIRECT /en/sign-in");
  });

  it("refuses the operator console to a signed-in non-operator", async () => {
    platformRequest.mockResolvedValue(user);

    await expect(requireOperator("en")).rejects.toThrow("REDIRECT /en/app");
  });

  it("admits an operator", async () => {
    platformRequest.mockResolvedValue({ ...user, role: "OPERATOR" });

    expect(await requireOperator("ka")).toMatchObject({ role: "OPERATOR" });
  });
});
