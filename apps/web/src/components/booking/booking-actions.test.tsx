import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { bookingActionsCopy } from "@/i18n/resources/bookings";

import { BookingActions } from "./booking-actions";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const bookingId = "52000000-0000-4000-8000-000000000003";
const copy = bookingActionsCopy("en");

const booking = {
  id: bookingId,
  userId: "00000000-0000-4000-8000-000000000101",
  observatoryId: "10000000-0000-4000-8000-000000000001",
  targetId: "30000000-0000-4000-8000-000000000021",
  slotStartAt: "2030-01-16T15:20:00.000Z",
  durationMinutes: 30,
  status: "CANCELLED",
  priceMinor: 4500,
  currency: "GEL",
  createdAt: "2026-09-29T09:00:00.000Z",
};

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  refresh.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderActions(props: { cancellable?: boolean; refundable?: boolean } = {}) {
  return render(
    <BookingActions
      bookingId={bookingId}
      cancellable={props.cancellable ?? true}
      refundable={props.refundable ?? false}
      signInPath="/en/sign-in"
      copy={copy}
    />,
  );
}

describe("BookingActions", () => {
  it("renders nothing when the booking can be neither cancelled nor refunded", () => {
    const { container } = renderActions({ cancellable: false });
    expect(container).toBeEmptyDOMElement();
  });

  it("asks before cancelling, then cancels once and re-reads the page", async () => {
    fetchMock.mockResolvedValue(answer(200, booking));
    renderActions();

    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(copy.cancelQuestion)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: copy.cancelConfirm }));

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/bookings/${bookingId}/cancel`);
    expect(init).toMatchObject({ method: "POST", body: "{}" });
  });

  it("keeps the booking when the customer says so", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    fireEvent.click(screen.getByRole("button", { name: copy.cancelKeep }));
    expect(screen.getByRole("button", { name: copy.cancel })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says the booking changed on a 409, and does not retry", async () => {
    fetchMock.mockResolvedValue(
      answer(409, { code: "CONFLICT", message: "The booking is already EXPIRED." }),
    );
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    fireEvent.click(screen.getByRole("button", { name: copy.cancelConfirm }));

    expect(await screen.findByRole("alert")).toHaveTextContent(copy.changed);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refunds with no body, and says so when the provider cannot refund yet", async () => {
    fetchMock.mockResolvedValue(
      answer(503, { code: "SERVICE_UNAVAILABLE", message: "No refund integration." }),
    );
    renderActions({ cancellable: false, refundable: true });

    fireEvent.click(screen.getByRole("button", { name: copy.refund }));

    expect(await screen.findByRole("alert")).toHaveTextContent(copy.refundUnavailable);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/bookings/${bookingId}/refund`);
    expect(init.body).toBeUndefined();
  });

  it("refuses an answer the contract does not allow", async () => {
    fetchMock.mockResolvedValue(answer(200, { ...booking, status: "HELD" }));
    renderActions({ cancellable: false, refundable: true });

    fireEvent.click(screen.getByRole("button", { name: copy.refund }));

    expect(await screen.findByRole("alert")).toHaveTextContent(copy.failed);
    expect(refresh).not.toHaveBeenCalled();
  });
});
