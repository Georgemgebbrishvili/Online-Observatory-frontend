import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { reserveCopy } from "@/i18n/resources/reserve";

import { checkoutTarget } from "@/features/booking/checkout";

import { ReserveForm } from "./reserve-form";

const copy = reserveCopy.en.form;
const observatoryId = "10000000-0000-4000-8000-000000000001";
const slotStartAt = "2030-01-15T14:00:00.000Z";
const bookingId = "57000000-0000-4000-8000-000000000008";
const paymentId = "67000000-0000-4000-8000-000000000008";

const choices = [
  { id: "30000000-0000-4000-8000-000000000021", name: "Albireo", detail: "Double star" },
  { id: "30000000-0000-4000-8000-000000000006", name: "Saturn", detail: "Planet" },
];

function created(redirectUrl: string | null) {
  const paymentIntent = redirectUrl
    ? { paymentId, provider: "SANDBOX", status: "PENDING", redirectUrl, expiresAt: null }
    : null;
  return {
    booking: {
      id: bookingId,
      userId: "00000000-0000-4000-8000-000000000101",
      observatoryId,
      targetId: choices[1].id,
      slotStartAt,
      durationMinutes: 30,
      status: "PENDING_PAYMENT",
      priceMinor: 4500,
      currency: "GEL",
      paymentId,
      paymentIntent,
      createdAt: "2026-09-30T10:00:00.000Z",
    },
    paymentIntent,
  };
}

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const fetchMock = vi.fn();
const assign = vi.hoisted(() => vi.fn());
vi.mock("@/lib/platform/browser", async (actual) => ({
  ...(await actual<typeof import("@/lib/platform/browser")>()),
  navigateWithFreshSession: assign,
}));

beforeEach(() => {
  fetchMock.mockReset();
  assign.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderForm(list = choices) {
  return render(
    <ReserveForm
      observatoryId={observatoryId}
      slotStartAt={slotStartAt}
      durationMinutes={30}
      choices={list}
      locale="en"
      signInPath="/en/sign-in"
      copy={copy}
    />,
  );
}

describe("checkoutTarget", () => {
  const origin = "http://localhost:3000";

  it("follows this origin's sandbox checkout and a provider's https page", () => {
    expect(checkoutTarget(`${origin}/api/payments/x/sandbox-checkout`, origin)).toBe(
      `${origin}/api/payments/x/sandbox-checkout`,
    );
    expect(checkoutTarget("https://pay.example/checkout", origin)).toBe(
      "https://pay.example/checkout",
    );
  });

  it("refuses anything else", () => {
    expect(checkoutTarget("http://elsewhere.example/pay", origin)).toBeNull();
    expect(checkoutTarget("javascript:alert(1)", origin)).toBeNull();
  });
});

describe("ReserveForm", () => {
  it("waits for a target, then reserves it once and follows the checkout", async () => {
    fetchMock.mockResolvedValue(
      answer(201, created(`${window.location.origin}/api/payments/p/sandbox-checkout`)),
    );
    renderForm();

    const reserve = screen.getByRole("button", { name: copy.reserve });
    expect(reserve).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: /Saturn/ }));
    fireEvent.click(reserve);

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        `${window.location.origin}/api/payments/p/sandbox-checkout`,
      ),
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/bookings");
    expect(init.method).toBe("POST");
    expect(init.headers["Idempotency-Key"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.parse(init.body)).toEqual({
      observatoryId,
      targetId: choices[1].id,
      slotStartAt,
      durationMinutes: 30,
      locale: "en",
    });
  });

  it("chooses the only target by itself", () => {
    renderForm([choices[0]]);
    expect(screen.getByRole("radio", { name: /Albireo/ })).toBeChecked();
    expect(screen.getByRole("button", { name: copy.reserve })).toBeEnabled();
  });

  it("goes to the booking when there is no payment to make", async () => {
    fetchMock.mockResolvedValue(answer(201, created(null)));
    renderForm([choices[0]]);
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(`/en/app/bookings/${bookingId}`),
    );
  });

  it("does not follow a checkout it cannot trust, and shows the booking instead", async () => {
    fetchMock.mockResolvedValue(answer(201, created("http://elsewhere.example/pay")));
    renderForm([choices[0]]);
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(`/en/app/bookings/${bookingId}`),
    );
  });

  it("says the slot was taken, and retries with the same key", async () => {
    fetchMock.mockResolvedValueOnce(
      answer(409, {
        code: "SLOT_UNAVAILABLE",
        message: "That slot has just been booked.",
      }),
    );
    fetchMock.mockResolvedValueOnce(answer(500, { code: "INTERNAL", message: "Down." }));
    renderForm([choices[0]]);

    const reserve = screen.getByRole("button", { name: copy.reserve });
    fireEvent.click(reserve);
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.taken);

    fireEvent.click(reserve);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(copy.failed));

    const keys = fetchMock.mock.calls.map(([, init]) => init.headers["Idempotency-Key"]);
    expect(keys[0]).toBe(keys[1]);
    expect(assign).not.toHaveBeenCalled();
  });

  it("names a target that has set", async () => {
    fetchMock.mockResolvedValue(
      answer(422, { code: "TARGET_NOT_OBSERVABLE", message: "Not observable." }),
    );
    renderForm([choices[0]]);
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.notObservable);
  });

  it("refuses an answer the contract does not allow", async () => {
    fetchMock.mockResolvedValue(answer(201, { booking: { id: bookingId } }));
    renderForm([choices[0]]);
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.failed);
    expect(assign).not.toHaveBeenCalled();
  });
});

describe("ReserveForm replacing a lost slot", () => {
  const lostId = "53000000-0000-4000-8000-000000000004";

  function renderReplacing() {
    return render(
      <ReserveForm
        observatoryId={observatoryId}
        slotStartAt={slotStartAt}
        durationMinutes={30}
        choices={choices}
        locale="en"
        signInPath="/en/sign-in"
        copy={copy}
        replacing={{ bookingId: lostId, targetId: choices[1].id }}
      />,
    );
  }

  it("keeps the lost booking's target, claims the slot and opens the new booking", async () => {
    fetchMock.mockResolvedValue(
      answer(201, {
        ...created(null).booking,
        status: "CONFIRMED",
        priceMinor: 0,
        paymentId: null,
        paymentIntent: null,
      }),
    );
    renderReplacing();

    expect(screen.getByRole("radio", { name: /Saturn/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(`/en/app/bookings/${bookingId}`),
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/bookings/${lostId}/reschedule`);
    expect(init.method).toBe("POST");
    expect(init.headers["Idempotency-Key"]).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ slotStartAt, targetId: choices[1].id });
  });

  it("goes back to the lost booking when its free slot is already claimed", async () => {
    fetchMock.mockResolvedValue(
      answer(409, {
        code: "CONFLICT",
        message: "This booking has no open refund or reschedule.",
      }),
    );
    renderReplacing();
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(`/en/app/bookings/${lostId}`),
    );
  });

  it("says a slot taken a moment ago was taken", async () => {
    fetchMock.mockResolvedValue(
      answer(409, {
        code: "SLOT_UNAVAILABLE",
        message: "That slot has just been taken.",
      }),
    );
    renderReplacing();
    fireEvent.click(screen.getByRole("button", { name: copy.reserve }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.taken);
    expect(assign).not.toHaveBeenCalled();
  });
});
