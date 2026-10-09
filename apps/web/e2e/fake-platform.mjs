// A stand-in for darkview-platform's API, for end-to-end tests only. It behaves as
// ADR-016 specifies — exact Origin check on every mutation, two cookies, a session
// valid only when both arrive — and every body it sends is parsed by the generated
// contract validators, so it cannot drift into a shape the contract does not have.
import { createHash, randomUUID } from "node:crypto";
import http from "node:http";

import {
  zAdminCancelMissionRequest,
  zAdminListAuditEventsResponse,
  zAdminListMissionsResponse,
  zAdminUpdateTargetRequest,
  zAdminUpdateTargetResponse,
  zApiError,
  zChangeEmailRequest,
  zChangePasswordRequest,
  zDeleteAccountRequest,
  zCreateBookingBody,
  zCreateBookingResponse,
  zGetBookingResponse,
  zGetCaptureDownloadResponse,
  zGetCaptureResponse,
  zGetMissionResponse,
  zGetMissionWatchViewResponse,
  zGetObservatoryConditionsResponse,
  zGetObservatoryStatusResponse,
  zGetTargetResponse,
  zJoinMissionAsObserverResponse,
  zListBookableObservatoriesResponse,
  zListBookingsResponse,
  zListCapturesResponse,
  zListMissionEventsResponse,
  zListMissionsResponse,
  zListSlotTargetsResponse,
  zListSlotsResponse,
  zListTargetsResponse,
  zListTonightTargetsResponse,
  zMissionChannelMessage,
  zMissionClientMessage,
  zMissionCommandAccepted,
  zOperatorObservatoryState,
  zOperatorOverrideRequest,
  zPasswordResetConfirmRequest,
  zPasswordResetRequest,
  zPurchaseObserverPackResponse,
  zRegisterRequest,
  zRescheduleBookingBody,
  zRescheduleBookingResponse,
  zSetMissionObservationBody,
  zSetMissionObservationResponse,
  zSetObservatoryModeRequest,
  zStartMissionSessionResponse,
  zSubmitMissionCommandBody,
  zSubmitMissionCommandResponse,
  zUpdateProfileRequest,
  zUser,
  zVerifyEmailRequest,
} from "@darkview/contracts/zod";

const port = Number(process.env.FAKE_PLATFORM_PORT ?? 4100);
const appOrigin = process.env.FAKE_PLATFORM_APP_URL ?? "http://localhost:3000";
const sessionCookie = "darkview_session";
const csrfCookie = "darkview_csrf";

// The observer owns the simulated live mission (OBSERVING), which /app/live opens.
const fakeAccounts = {
  "observer@darkview.test": {
    id: "00000000-0000-4000-8000-000000000001",
    role: "USER",
    displayName: "Observer",
  },
  "operator@darkview.test": {
    id: "00000000-0000-4000-8000-000000000002",
    role: "OPERATOR",
    displayName: "Operator",
  },
  // Phase 4 slice 5: Nino owns the sessions open to watchers; the observer and the
  // Georgian-speaking watcher sit in them. Their locale is where the checkout returns.
  "nino@darkview.test": {
    id: "00000000-0000-4000-8000-000000000003",
    role: "USER",
    displayName: "Nino",
  },
  "watcher@darkview.test": {
    id: "00000000-0000-4000-8000-000000000004",
    role: "USER",
    displayName: "Watcher",
    locale: "ka",
  },
  // Design slice B6: an operator whose every read of the catalogue fails, so the visual
  // gate can capture the route error screen. Nothing else differs from the operator.
  "failing@darkview.test": {
    id: "00000000-0000-4000-8000-000000000005",
    role: "OPERATOR",
    displayName: "Failing operator",
  },
  // Account slice 2: edits its profile, address and password in e2e, for the same reason.
  "profiled@darkview.test": {
    id: "00000000-0000-4000-8000-000000000007",
    role: "USER",
    displayName: "Profiled",
  },
  // C4 (ADR-044): deletes itself in e2e. Nothing else signs in as it.
  "leaving@darkview.test": {
    id: "00000000-0000-4000-8000-000000000008",
    role: "USER",
    displayName: "Leaving",
  },
  // Account slice 1: resets its password in e2e, so no other test's sign-in depends on it.
  "forgetful@darkview.test": {
    id: "00000000-0000-4000-8000-000000000006",
    role: "USER",
    displayName: "Forgetful",
  },
};
const fakePassword = "correct horse battery";

const users = new Map(
  Object.entries(fakeAccounts).map(([email, account]) => [
    email,
    zUser.parse({
      id: account.id,
      email,
      displayName: account.displayName,
      role: account.role,
      locale: account.locale ?? "en",
      createdAt: "2026-09-01T00:00:00.000Z",
    }),
  ]),
);
const sessions = new Map();
// Accounts registered through POST /auth/register: their own password, and the links
// awaiting verification. The link is printed rather than mailed, as dev/mail-sink.mjs
// prints it on the full stack.
const passwords = new Map();
const pendingVerifications = new Map();
// ADR-040's reset links, token -> email. The token is derived from the address,
// sha256("reset:<email>") in base64url, so a test can open the link it asked for
// without reading this process's output. Used once, it is gone until asked for again.
const pendingResets = new Map();
const resetToken = (email) =>
  createHash("sha256").update(`reset:${email}`).digest("base64url");
// ADR-042's change links, token -> { userId, email }, derived from the new address the
// same way, and consumed by POST /auth/verify-email like a registration link.
const pendingEmailChanges = new Map();
const emailChangeToken = (email) =>
  createHash("sha256").update(`email-change:${email}`).digest("base64url");

// One simulated first-party observatory with one live mission, as the simulator
// agent would report it. PARK takes a moment to land, like a real mount.
const observatoryId = "10000000-0000-4000-8000-000000000001";
const missionId = "20000000-0000-4000-8000-000000000001";
const observatories = zListBookableObservatoriesResponse.parse({
  items: [
    {
      id: observatoryId,
      slug: "tbilisi",
      kind: "FIRST_PARTY",
      nameEn: "Stellar Tbilisi",
      nameKa: "სტელარი თბილისი",
      city: "Tbilisi",
      countryCode: "GE",
      timezone: "Asia/Tbilisi",
      telescope: {
        manufacturer: "Celestron",
        model: "NexStar 6SE",
        apertureMm: 150,
        focalLengthMm: 1500,
      },
    },
  ],
});
const targets = zListTargetsResponse.parse({
  items: [
    {
      id: "30000000-0000-4000-8000-000000000013",
      slug: "m13-hercules-cluster",
      type: "GLOBULAR_CLUSTER",
      catalogId: "M13",
      nameEn: "Hercules Cluster",
      nameKa: "ჰერკულესის გროვა",
      positionSource: "FIXED",
      coordinates: { raHours: 16.695, decDegrees: 36.46, epoch: "J2000" },
      solarSystemBody: null,
      angularSizeArcmin: 20,
      magnitude: 5.8,
      opticalConfig: "F6_3_REDUCER",
      imagingProfile: "GLOBULAR_CLUSTER",
      minAltitudeDegrees: 25,
      expectedMissionMinutes: 10,
      enabled: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000006",
      slug: "saturn",
      type: "PLANET",
      catalogId: null,
      nameEn: "Saturn",
      nameKa: "სატურნი",
      descriptionEn:
        "The ringed planet. Its rings and largest moon, Titan, show in a short live stack.",
      descriptionKa:
        "რგოლებიანი პლანეტა. მისი რგოლები და უდიდესი თანამგზავრი, ტიტანი, მოკლე ცოცხალ დასტაზე ჩანს.",
      positionSource: "EPHEMERIS",
      coordinates: null,
      solarSystemBody: "SATURN",
      angularSizeArcmin: 0.3,
      magnitude: 0.6,
      opticalConfig: "F20_BARLOW",
      imagingProfile: "PLANETARY",
      minAltitudeDegrees: 20,
      expectedMissionMinutes: 10,
      enabled: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000021",
      slug: "albireo",
      type: "DOUBLE_STAR",
      catalogId: "Beta Cygni",
      nameEn: "Albireo",
      nameKa: "ალბირეო",
      descriptionEn: "A gold and blue pair of stars, split cleanly at this focal length.",
      descriptionKa:
        "ოქროსფერი და ცისფერი ვარსკვლავების წყვილი, რომელიც ამ ფოკუსურ მანძილზე მკაფიოდ იყოფა.",
      positionSource: "FIXED",
      coordinates: { raHours: 19.512, decDegrees: 27.96, epoch: "J2000" },
      solarSystemBody: null,
      angularSizeArcmin: 0.6,
      magnitude: 3.1,
      opticalConfig: "F10_NATIVE",
      imagingProfile: "DOUBLE_STAR",
      minAltitudeDegrees: 25,
      expectedMissionMinutes: 15,
      enabled: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000031",
      slug: "moon-terminator",
      type: "MOON",
      catalogId: null,
      nameEn: "Moon",
      nameKa: "მთვარე",
      positionSource: "EPHEMERIS",
      coordinates: null,
      solarSystemBody: "MOON",
      angularSizeArcmin: 31,
      magnitude: -10,
      opticalConfig: "F10_NATIVE",
      imagingProfile: "LUNAR",
      minAltitudeDegrees: 25,
      expectedMissionMinutes: 15,
      enabled: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000032",
      slug: "venus",
      type: "PLANET",
      catalogId: null,
      nameEn: "Venus",
      nameKa: "ვენერა",
      positionSource: "EPHEMERIS",
      coordinates: null,
      solarSystemBody: "VENUS",
      angularSizeArcmin: 0.4,
      magnitude: -4.1,
      opticalConfig: "F20_BARLOW",
      imagingProfile: "PLANETARY",
      minAltitudeDegrees: 25,
      expectedMissionMinutes: 15,
      enabled: true,
    },
  ],
  page: { hasMore: false, nextCursor: null },
});

// GET /targets/tonight. Fixed readings rather than an ephemeris, so every run and every
// visual baseline sees the same sky: two observable, three blocked for different reasons.
// A target the operator disables reads TARGET_DISABLED, ahead of the sky, as the
// platform orders its checks.
const tonightSky = {
  albireo: {
    altitude: 61,
    azimuth: 250,
    rises: null,
    sets: "2026-09-25T23:50:00Z",
    reasons: [],
  },
  saturn: {
    altitude: 38,
    azimuth: 160,
    rises: "2026-09-25T14:30:00Z",
    sets: "2026-09-26T01:40:00Z",
    reasons: [],
  },
  "moon-terminator": {
    altitude: 44,
    azimuth: 200,
    rises: "2026-09-25T13:10:00Z",
    sets: "2026-09-25T22:20:00Z",
    reasons: ["DOES_NOT_FIT_FIELD"],
  },
  "m13-hercules-cluster": {
    altitude: 18,
    azimuth: 290,
    rises: null,
    sets: "2026-09-25T21:05:00Z",
    reasons: ["BELOW_MIN_ALTITUDE"],
  },
  venus: {
    altitude: -12,
    azimuth: 275,
    rises: "2026-09-26T02:15:00Z",
    sets: null,
    reasons: ["BELOW_HORIZON"],
  },
};
const tonightEvaluatedAt = "2026-09-25T18:00:00Z";

function tonightTargets() {
  return zListTonightTargetsResponse.parse({
    observatoryId,
    evaluatedAt: tonightEvaluatedAt,
    items: targets.items.map((target) => {
      const sky = tonightSky[target.slug];
      const blockReasons = [
        ...(target.enabled ? [] : ["TARGET_DISABLED"]),
        ...sky.reasons,
      ];
      return {
        target,
        visibility: {
          observable: blockReasons.length === 0,
          evaluatedAt: tonightEvaluatedAt,
          horizontal: { altitudeDegrees: sky.altitude, azimuthDegrees: sky.azimuth },
          sunAltitudeDegrees: -24,
          moonSeparationDegrees: 70,
          risesAt: sky.rises,
          setsAt: sky.sets,
          blockReasons,
        },
      };
    }),
  });
}
const observatory = { mode: "SIMULATED", parked: false, activeMissionId: missionId };

// DV-078. Missions and audit events, mutable so cancel and enable/disable are visible.
// Paged two at a time so the cursor is actually exercised rather than assumed.
const PAGE_SIZE = 2;
const userId = fakeAccounts["observer@darkview.test"].id;
const missions = [
  {
    id: missionId,
    userId,
    bookingId: "50000000-0000-4000-8000-000000000001",
    targetId: "30000000-0000-4000-8000-000000000013",
    observatoryId,
    state: "OBSERVING",
    failureReason: null,
    mode: "SIMULATED",
    scheduledStartAt: "2026-09-23T20:00:00.000Z",
    requestedAt: "2026-09-23T19:40:00.000Z",
    startedAt: "2026-09-23T20:00:00.000Z",
    endedAt: null,
    captureIds: [],
    observable: false,
    observerCapacity: 5,
  },
  {
    id: "21000000-0000-4000-8000-000000000002",
    userId,
    bookingId: "51000000-0000-4000-8000-000000000002",
    targetId: "30000000-0000-4000-8000-000000000006",
    observatoryId,
    state: "SCHEDULED",
    failureReason: null,
    mode: "SIMULATED",
    // Upcoming is judged against the server's real clock, which the visual gate cannot
    // fix, so this stays far enough ahead to be upcoming on every run, and fixed so a
    // baseline never drifts.
    scheduledStartAt: "2030-01-15T18:00:00.000Z",
    requestedAt: "2026-09-23T18:00:00.000Z",
    startedAt: null,
    endedAt: null,
    captureIds: [],
    observable: false,
    observerCapacity: 5,
  },
  {
    id: "22000000-0000-4000-8000-000000000003",
    userId,
    bookingId: null,
    targetId: "30000000-0000-4000-8000-000000000013",
    observatoryId,
    state: "COMPLETE",
    failureReason: null,
    mode: "SIMULATED",
    scheduledStartAt: "2026-09-22T20:00:00.000Z",
    requestedAt: "2026-09-22T19:30:00.000Z",
    startedAt: "2026-09-22T20:00:00.000Z",
    endedAt: "2026-09-22T20:12:00.000Z",
    captureIds: [
      "60000000-0000-4000-8000-000000000001",
      "60000000-0000-4000-8000-000000000002",
      "60000000-0000-4000-8000-000000000003",
    ],
    observable: false,
    observerCapacity: 5,
  },
];

// GET /missions/{id}/events: each mission's history, oldest first as the platform
// orders it, one minute apart from the mission's start. Paged by PAGE_SIZE with the
// platform's cursor, the last event's id, so the room reads more than one page.
// Phase 3 slice 3: the observer's bookings, one in every state, as `GET /bookings` answers
// them: latest slot first, keyset on the id. Four to a page, so paging is exercised.
//
// Cancelling and refunding change a booking. The change is kept for the session that
// made it, so a test that cancels or refunds signs in on a session of its own, and every
// other test, and every baseline, sees the bookings as they are here.
const BOOKINGS_PAGE_SIZE = 4;
const booking = (row) => ({
  userId,
  observatoryId,
  durationMinutes: 30,
  priceMinor: 4500,
  currency: "GEL",
  paymentId: null,
  missionId: null,
  tierDiscountMinor: 0,
  loyaltyPointsRedeemed: 0,
  subscriptionMinutesSpent: 0,
  paymentIntent: null,
  entitlement: null,
  ...row,
});
const bookings = [
  // Held, with the intent `createBooking` answered (ADR-043): the page can pay from it.
  booking({
    id: "52000000-0000-4000-8000-000000000003",
    targetId: "30000000-0000-4000-8000-000000000021",
    slotStartAt: "2030-01-16T15:20:00.000Z",
    status: "PENDING_PAYMENT",
    paymentId: "62000000-0000-4000-8000-000000000003",
    paymentIntent: {
      paymentId: "62000000-0000-4000-8000-000000000003",
      provider: "SANDBOX",
      status: "PENDING",
      redirectUrl: `${appOrigin}/api/payments/62000000-0000-4000-8000-000000000003/sandbox-checkout`,
      expiresAt: "2030-01-16T14:35:00.000Z",
    },
    createdAt: "2026-09-29T09:00:00.000Z",
  }),
  booking({
    id: "51000000-0000-4000-8000-000000000002",
    targetId: "30000000-0000-4000-8000-000000000006",
    slotStartAt: "2030-01-15T18:00:00.000Z",
    status: "CONFIRMED",
    paymentId: "61000000-0000-4000-8000-000000000002",
    missionId: "21000000-0000-4000-8000-000000000002",
    tierDiscountMinor: 450,
    createdAt: "2026-09-25T09:00:00.000Z",
  }),
  booking({
    id: "50000000-0000-4000-8000-000000000001",
    targetId: "30000000-0000-4000-8000-000000000013",
    slotStartAt: "2026-09-23T20:00:00.000Z",
    status: "CONFIRMED",
    paymentId: "60000000-0000-4000-8000-000000000001",
    missionId,
    createdAt: "2026-09-21T09:00:00.000Z",
  }),
  booking({
    id: "53000000-0000-4000-8000-000000000004",
    targetId: "30000000-0000-4000-8000-000000000031",
    slotStartAt: "2026-09-20T16:00:00.000Z",
    status: "CONFIRMED",
    paymentId: "63000000-0000-4000-8000-000000000004",
    entitlement: {
      status: "OPEN",
      cause: "WEATHER",
      minutesLost: 18,
      expiresAt: "2026-10-20T16:30:00.000Z",
      rescheduledBookingId: null,
    },
    createdAt: "2026-09-18T09:00:00.000Z",
  }),
  booking({
    id: "54000000-0000-4000-8000-000000000005",
    targetId: "30000000-0000-4000-8000-000000000032",
    slotStartAt: "2026-09-18T15:00:00.000Z",
    status: "EXPIRED",
    paymentId: "64000000-0000-4000-8000-000000000005",
    createdAt: "2026-09-17T09:00:00.000Z",
  }),
  booking({
    id: "55000000-0000-4000-8000-000000000006",
    targetId: "30000000-0000-4000-8000-000000000013",
    slotStartAt: "2026-09-15T17:20:00.000Z",
    status: "REFUNDED",
    paymentId: "65000000-0000-4000-8000-000000000006",
    entitlement: {
      status: "REFUNDED",
      cause: "OBSERVATORY_FAULT",
      minutesLost: 30,
      expiresAt: "2026-10-15T17:50:00.000Z",
      rescheduledBookingId: null,
    },
    createdAt: "2026-09-14T09:00:00.000Z",
  }),
  booking({
    id: "56000000-0000-4000-8000-000000000007",
    targetId: "30000000-0000-4000-8000-000000000006",
    slotStartAt: "2026-09-12T16:40:00.000Z",
    status: "CANCELLED",
    paymentId: "66000000-0000-4000-8000-000000000007",
    createdAt: "2026-09-11T09:00:00.000Z",
  }),
].map((row) => zGetBookingResponse.parse(row));
const bookingChanges = new Map();
// Bookings made through `POST /bookings`, by the session that made them.
const createdBookings = new Map();

/** The caller's bookings, with the changes their session has made. */
function bookingsOf(request, user) {
  const session = cookiesOf(request)[sessionCookie];
  const changes = bookingChanges.get(session) ?? new Map();
  return [...bookings, ...(createdBookings.get(session) ?? [])]
    .filter((row) => row.userId === user.id)
    .map((row) => changes.get(row.id) ?? row);
}

async function changeBooking(request, response, id, action) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const row = bookingsOf(request, user).find((candidate) => candidate.id === id);
  if (!row) return error(response, 404, "NOT_FOUND", "No such booking.");
  // As `cancelMyBooking` and the refund: the same refusals, the same codes.
  if (action === "cancel" && row.status === "CONFIRMED") {
    return error(
      response,
      409,
      "CONFLICT",
      "A paid booking cannot be cancelled until refunds are available.",
    );
  }
  if (action === "cancel" && row.status !== "PENDING_PAYMENT") {
    return error(response, 409, "CONFLICT", `The booking is already ${row.status}.`);
  }
  if (action === "refund" && row.entitlement?.status !== "OPEN") {
    return error(response, 409, "CONFLICT", "No open entitlement.");
  }
  const changed = zGetBookingResponse.parse(
    action === "cancel"
      ? { ...row, status: "CANCELLED", paymentIntent: null }
      : {
          ...row,
          status: "REFUNDED",
          entitlement: { ...row.entitlement, status: "REFUNDED" },
        },
  );
  const key = cookiesOf(request)[sessionCookie];
  if (!bookingChanges.has(key)) bookingChanges.set(key, new Map());
  bookingChanges.get(key).set(id, changed);
  send(response, 200, changed);
}

// Phase 3 slices 2 and 4: reserving a slot and the sandbox checkout, as `POST /bookings`
// and `GET|POST /payments/{id}/sandbox-checkout` answer them. The slots are GET /slots';
// the ninth is refused as taken a moment ago, standing in for the race the exclusion
// constraint settles. A booking made here belongs to the session that made it, like the
// changes above, and is listed with the others.
const TAKEN_SLOT_INDEX = 8;
const idempotentBookings = new Map();
const payments = new Map();

/** Which of GET /slots' nine slots an instant starts, or null for none. */
function slotAt(startAt) {
  const at = Date.parse(startAt);
  // Every slot starts within six hours of its night's 14:00 UTC.
  const night = new Date(at - 14 * 3_600_000).toISOString().slice(0, 10);
  const index = (at - Date.parse(`${night}T14:00:00.000Z`)) / (40 * 60_000);
  return Number.isInteger(index) && index >= 0 && index < 9 ? index : null;
}

/** A slot judged as the fake's sky judges tonight: the same targets up, the same reasons. */
function slotTargets(startAt, durationMinutes) {
  return zListSlotTargetsResponse.parse({
    observatoryId,
    startAt,
    durationMinutes,
    items: tonightTargets().items.map(({ target, visibility }) => ({
      target,
      visibility: {
        observable: visibility.observable,
        blockReasons: visibility.blockReasons,
        atStart: visibility,
      },
    })),
  });
}

async function createBooking(request, response) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const session = cookiesOf(request)[sessionCookie];
  const key = request.headers["idempotency-key"];
  const replay = key && idempotentBookings.get(`${session}:${key}`);
  if (replay) return send(response, 201, replay);

  const body = zCreateBookingBody.safeParse(await json(request));
  if (!body.success)
    return error(response, 422, "VALIDATION_FAILED", "Malformed booking.");
  const {
    observatoryId: requested,
    targetId,
    slotStartAt,
    durationMinutes,
    locale,
  } = body.data;
  if (requested !== observatoryId)
    return error(response, 404, "NOT_FOUND", "No such observatory.");
  const index = slotAt(slotStartAt);
  if (index === null || durationMinutes !== 30)
    return error(response, 422, "VALIDATION_FAILED", "That is not an offered slot.");
  if (index === 1 || index === TAKEN_SLOT_INDEX)
    return error(response, 409, "SLOT_UNAVAILABLE", "That slot has just been booked.");
  const judged = slotTargets(slotStartAt, durationMinutes).items.find(
    (item) => item.target.id === targetId,
  );
  if (!judged) return error(response, 404, "NOT_FOUND", "No such target.");
  if (!judged.visibility.observable)
    return error(
      response,
      422,
      "TARGET_NOT_OBSERVABLE",
      "The target is not observable across that slot.",
    );

  const paymentId = randomUUID();
  const paymentIntent = {
    paymentId,
    provider: "SANDBOX",
    status: "PENDING",
    // As the platform: its checkout page, on the web client's origin under /api.
    redirectUrl: `${appOrigin}/api/payments/${paymentId}/sandbox-checkout`,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  };
  const booking = zGetBookingResponse.parse({
    id: randomUUID(),
    userId: user.id,
    observatoryId,
    targetId,
    slotStartAt: new Date(slotStartAt).toISOString(),
    durationMinutes,
    status: "PENDING_PAYMENT",
    priceMinor: 4500,
    currency: "GEL",
    paymentId,
    paymentIntent,
    missionId: null,
    tierDiscountMinor: 0,
    loyaltyPointsRedeemed: 0,
    subscriptionMinutesSpent: 0,
    entitlement: null,
    createdAt: new Date().toISOString(),
  });
  const answer = zCreateBookingResponse.parse({ booking, paymentIntent });
  if (!createdBookings.has(session)) createdBookings.set(session, []);
  createdBookings.get(session).push(booking);
  payments.set(paymentId, { session, bookingId: booking.id, locale: locale ?? "en" });
  if (key) idempotentBookings.set(`${session}:${key}`, answer);
  send(response, 201, answer);
}

/**
 * A free replacement for a lost slot, as `rescheduleMyBooking` answers: an OPEN
 * entitlement, a slot GET /slots offers, a target up across it; confirmed at once, free,
 * and the entitlement claimed. The fake makes no mission for it.
 */
async function rescheduleBooking(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const session = cookiesOf(request)[sessionCookie];
  const original = bookingsOf(request, user).find((candidate) => candidate.id === id);
  if (!original) return error(response, 404, "NOT_FOUND", "No such booking.");
  if (original.entitlement?.status !== "OPEN")
    return error(
      response,
      409,
      "CONFLICT",
      "This booking has no open refund or reschedule.",
    );

  const body = zRescheduleBookingBody.safeParse(await json(request));
  if (!body.success)
    return error(
      response,
      422,
      "VALIDATION_FAILED",
      "RescheduleBookingRequest is malformed.",
    );
  const { slotStartAt } = body.data;
  const targetId = body.data.targetId ?? original.targetId;
  const index = slotAt(slotStartAt);
  if (index === null)
    return error(response, 422, "VALIDATION_FAILED", "That is not an offered slot.");
  if (index === 1 || index === TAKEN_SLOT_INDEX)
    return error(response, 409, "SLOT_UNAVAILABLE", "That slot has just been taken.");
  const judged = slotTargets(slotStartAt, original.durationMinutes).items.find(
    (item) => item.target.id === targetId,
  );
  if (!judged) return error(response, 404, "NOT_FOUND", "No such target.");
  if (!judged.visibility.observable)
    return error(
      response,
      422,
      "TARGET_NOT_OBSERVABLE",
      "The target is not observable across that slot.",
    );

  const replacement = zRescheduleBookingResponse.parse({
    ...original,
    id: randomUUID(),
    targetId,
    slotStartAt: new Date(slotStartAt).toISOString(),
    status: "CONFIRMED",
    priceMinor: 0,
    paymentId: null,
    paymentIntent: null,
    missionId: null,
    tierDiscountMinor: 0,
    loyaltyPointsRedeemed: 0,
    subscriptionMinutesSpent: 0,
    entitlement: null,
    createdAt: new Date().toISOString(),
  });
  if (!createdBookings.has(session)) createdBookings.set(session, []);
  createdBookings.get(session).push(replacement);
  if (!bookingChanges.has(session)) bookingChanges.set(session, new Map());
  bookingChanges.get(session).set(
    id,
    zGetBookingResponse.parse({
      ...original,
      entitlement: {
        ...original.entitlement,
        status: "RESCHEDULED",
        rescheduledBookingId: replacement.id,
      },
    }),
  );
  send(response, 201, replacement);
}

/** The sandbox provider's page, standing in for a hosted checkout: pay or decline. */
async function sandboxCheckout(request, response, paymentId) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const session = cookiesOf(request)[sessionCookie];
  const payment = payments.get(paymentId);
  if (!payment || payment.session !== session)
    return error(response, 404, "NOT_FOUND", "No such payment.");

  if (request.method === "GET") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sandbox checkout</title></head><body>
<h1>Sandbox checkout</h1><p>No money moves.</p>
<form method="post"><button name="result" value="PAID">Pay</button><button name="result" value="DECLINED">Decline</button></form>
</body></html>`);
  }

  let raw = "";
  for await (const chunk of request) raw += chunk;
  const result = new URLSearchParams(raw).get("result");
  if (result !== "PAID" && result !== "DECLINED")
    return error(response, 422, "VALIDATION_FAILED", "Pay or decline.");
  if (payment.missionId) {
    settlePack(payment, result);
    response.writeHead(303, {
      location: `${appOrigin}/${payment.locale}/app/missions/${payment.missionId}/watch`,
    });
    return response.end();
  }
  const rows = createdBookings.get(session);
  const index = rows.findIndex((row) => row.id === payment.bookingId);
  rows[index] = zGetBookingResponse.parse({
    ...rows[index],
    status: result === "PAID" ? "CONFIRMED" : "CANCELLED",
    paymentIntent: null,
  });
  response.writeHead(303, {
    location: `${appOrigin}/${payment.locale}/app/bookings/${payment.bookingId}`,
  });
  response.end();
}

const missionHistories = {
  [missions[0].id]: [
    "REQUESTED",
    "SCHEDULED",
    "PREPARING",
    "SLEWING",
    "VERIFYING",
    "CENTERING",
    "OBSERVING",
  ],
  [missions[1].id]: ["REQUESTED", "SCHEDULED"],
  [missions[2].id]: [
    "REQUESTED",
    "SCHEDULED",
    "PREPARING",
    "SLEWING",
    "VERIFYING",
    "CENTERING",
    "OBSERVING",
    "CAPTURING",
    "PROCESSING",
    "COMPLETE",
  ],
};
const missionEvents = Object.fromEntries(
  missions.map((mission, missionIndex) => [
    mission.id,
    missionHistories[mission.id].map((state, index) => ({
      id: `7${missionIndex}000000-0000-4000-8000-0000000000${String(index).padStart(2, "0")}`,
      missionId: mission.id,
      at: new Date(Date.parse(mission.requestedAt) + index * 60_000).toISOString(),
      state,
      failureReason: null,
      source: index < 2 ? "CLOUD" : "AGENT",
      commandId: null,
      detail: null,
    })),
  ]),
);

// The observer's Collection: three simulated captures from the completed M13 mission,
// newest first. The first has every asset, the second no FITS, the third nothing but
// its record -- the agent that took it predates thumbnails. Paged by PAGE_SIZE with the
// platform's cursor, the last capture's id.
const storageOrigin = `http://127.0.0.1:${port}`;
const captures = [
  { n: 1, at: "2026-09-22T20:10:00.000Z", assets: ["THUMBNAIL", "IMAGE", "FITS"] },
  { n: 2, at: "2026-09-22T20:06:00.000Z", assets: ["THUMBNAIL", "IMAGE"] },
  { n: 3, at: "2026-09-22T20:02:00.000Z", assets: [] },
].map(({ assets, at, n }) => ({
  assets,
  capture: zGetCaptureResponse.parse({
    id: `60000000-0000-4000-8000-00000000000${n}`,
    missionId: "22000000-0000-4000-8000-000000000003",
    userId,
    targetId: "30000000-0000-4000-8000-000000000013",
    capturedAt: at,
    imagingProfile: "GLOBULAR_CLUSTER",
    opticalConfig: "F6_3_REDUCER",
    exposureMilliseconds: 4000,
    gain: 200,
    framesStacked: 30 * n,
    integrationSeconds: 120 * n,
    widthPx: 3840,
    heightPx: 2160,
    solvedFocalLengthMm: n === 1 ? 948.2 : null,
    fitsAvailable: assets.includes("FITS"),
    visibility: "PRIVATE",
    mode: "SIMULATED",
    thumbnailUrl: null,
  }),
}));

// A stand-in for a presigned GET: the bucket's origin, a key, a signature that means nothing.
function signed(id, kind) {
  return `${storageOrigin}/storage/${id}/${kind.toLowerCase()}?X-Amz-Signature=fake`;
}

function withThumbnail({ assets, capture }) {
  return {
    ...capture,
    thumbnailUrl: assets.includes("THUMBNAIL") ? signed(capture.id, "THUMBNAIL") : null,
  };
}

// A drawn field of points, deterministic, so a baseline is stable. It stands in for a
// simulated frame and is only ever shown under the simulated badge.
function simulatedFrame() {
  const points = Array.from({ length: 90 }, (_, index) => {
    const angle = index * 2.39996;
    const radius = 6 + Math.sqrt(index) * 30;
    const x = (800 + Math.cos(angle) * radius).toFixed(1);
    const y = (450 + Math.sin(angle) * radius * 0.9).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${(3.2 - index / 40).toFixed(2)}" fill="#dfe6ec"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#05080d"/>${points}</svg>`;
}

const auditEvents = [
  {
    id: "70000000-0000-4000-8000-000000000001",
    at: "2026-09-23T20:00:02.000Z",
    category: "MISSION",
    action: "mission.started",
    actorUserId: userId,
    missionId,
    commandId: null,
    detail: { state: "OBSERVING" },
  },
  {
    id: "70000000-0000-4000-8000-000000000002",
    at: "2026-09-23T19:59:00.000Z",
    category: "OPERATOR_OVERRIDE",
    action: "override.goto",
    actorUserId: fakeAccounts["operator@darkview.test"].id,
    missionId,
    commandId: "80000000-0000-4000-8000-000000000001",
    detail: { reason: "Centring by hand" },
  },
  {
    id: "70000000-0000-4000-8000-000000000003",
    at: "2026-09-23T19:40:00.000Z",
    category: "AGENT_LINK",
    action: "agent.connected",
    actorUserId: null,
    missionId: null,
    commandId: null,
    detail: { agentVersion: "0.1.0-sim" },
  },
];

/** Cursor paging over an already-sorted array: the cursor is the next index. */
function paginate(rows, cursor) {
  const start = cursor ? Number(cursor) : 0;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const next = start + PAGE_SIZE;
  return {
    items: slice,
    page: {
      hasMore: next < rows.length,
      nextCursor: next < rows.length ? String(next) : null,
    },
  };
}

// DV-073. The public status view: no device address, no driver state, no credential.
function publicStatus() {
  return zGetObservatoryStatusResponse.parse({
    observatoryId,
    mode: observatory.mode,
    link: "ONLINE",
    weather: {
      status: "CLEAR",
      source: "OPERATOR",
      holdActive: false,
      note: null,
      updatedAt: new Date().toISOString(),
    },
    missionInProgress: observatory.activeMissionId !== null,
    // Null unless the session owner opted in (ADR-007); the fake keeps it null.
    currentTargetName: null,
    lastSuccessfulMissionAt: "2026-09-22T20:12:00.000Z",
    updatedAt: new Date().toISOString(),
  });
}

// Three bookable hours, the last of which has no stored forecast, so the page has to
// show an UNKNOWN hour rather than quietly implying it is clear.
function viewingConditions() {
  const fetchedAt = new Date(Date.now() - 20 * 60_000).toISOString();
  const known = (at, cloud, seeing) => ({
    at,
    status: "KNOWN",
    source: "OPEN_METEO",
    fetchedAt,
    cloudCoverPercent: cloud,
    cloudCoverLowPercent: Math.round(cloud / 3),
    cloudCoverMidPercent: Math.round(cloud / 3),
    cloudCoverHighPercent: Math.round(cloud / 3),
    precipitationProbabilityPercent: 5,
    relativeHumidityPercent: 62,
    windSpeedMetresPerSecond: 2.4,
    seeingArcseconds: seeing,
  });
  return zGetObservatoryConditionsResponse.parse({
    observatoryId,
    date: "2026-09-23",
    items: [
      known("2026-09-23T20:00:00.000Z", 12, 1.8),
      known("2026-09-23T21:00:00.000Z", 48, 2.6),
      {
        at: "2026-09-23T22:00:00.000Z",
        status: "UNKNOWN",
        source: null,
        fetchedAt: null,
        cloudCoverPercent: null,
        cloudCoverLowPercent: null,
        cloudCoverMidPercent: null,
        cloudCoverHighPercent: null,
        precipitationProbabilityPercent: null,
        relativeHumidityPercent: null,
        windSpeedMetresPerSecond: null,
        seeingArcseconds: null,
      },
    ],
  });
}

function observatoryState() {
  const now = new Date().toISOString();
  const device = { health: "OK", detail: null };
  return zOperatorObservatoryState.parse({
    observatoryId,
    activeMissionId: observatory.activeMissionId,
    activeSessionId: observatory.activeMissionId
      ? "40000000-0000-4000-8000-000000000001"
      : null,
    linkLatencyMs: null,
    lastHeartbeatAt: now,
    updatedAt: now,
    telemetry: {
      mode: observatory.mode,
      link: "ONLINE",
      mount: device,
      camera: device,
      focuser: device,
      weather: {
        status: "CLEAR",
        source: "OPERATOR",
        holdActive: false,
        note: null,
        updatedAt: now,
      },
      pointingEquatorial: observatory.parked
        ? null
        : { raHours: 16.695, decDegrees: 36.46, epoch: "J2000" },
      pointingHorizontal: observatory.parked
        ? { altitudeDegrees: 0, azimuthDegrees: 180 }
        : { altitudeDegrees: 61.2, azimuthDegrees: 241.7 },
      tracking: !observatory.parked,
      parked: observatory.parked,
      slewing: false,
      focuserPosition: 12_480,
      ambientTemperatureC: 14.5,
      agentVersion: "0.1.0-sim",
      reportedAt: now,
    },
    safetyEnvelope: {
      observatoryId,
      minAltitudeDegrees: 20,
      maxAltitudeDegrees: null,
      maxAltitudeMeasuredAt: null,
      maxAltitudeMeasuredBy: null,
      horizonMask: [],
      forbiddenAzimuthSectors: [],
      sunExclusionDegrees: 30,
      daylightLockSunAltitudeDegrees: -6,
      nudgeMaxDegrees: 1,
      nudgeRateDegreesPerSecond: 0.5,
      slewTimeoutSeconds: 120,
      heartbeatLossSeconds: 15,
      linkDeadSeconds: 60,
      refocusTemperatureDeltaC: 2,
      updatedAt: now,
    },
  });
}

function operator(request, response) {
  const user = sessionUser(request);
  if (!user) {
    error(response, 401, "UNAUTHENTICATED", "No session.");
    return false;
  }
  if (user.role !== "OPERATOR") {
    error(response, 403, "FORBIDDEN", "Operator only.");
    return false;
  }
  return true;
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, { "content-type": "application/json", ...headers });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

function error(response, status, code, message, details) {
  send(response, status, zApiError.parse({ code, message, ...(details && { details }) }));
}

function cookiesOf(request) {
  return Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([name, value]) => name && value),
  );
}

function sessionUser(request) {
  const cookies = cookiesOf(request);
  const session = sessions.get(cookies[sessionCookie]);
  return session && session.csrf === cookies[csrfCookie] ? session.user : null;
}

async function json(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const routes = {
  "GET /observatories": (_request, response) => send(response, 200, observatories),
  // Enabled only, as the platform answers (features/targets/catalogue.ts).
  "GET /targets": (request, response) =>
    sessionUser(request)?.id === fakeAccounts["failing@darkview.test"].id
      ? error(response, 500, "INTERNAL", "Simulated failure.")
      : send(
          response,
          200,
          zListTargetsResponse.parse({
            ...targets,
            items: targets.items.filter((row) => row.enabled),
          }),
        ),
  // GET /slots. Fixed, so every run and every baseline sees the same night: nine
  // 30-minute slots from 18:00 Tbilisi (UTC+4, no DST) on the platform's 40-minute
  // stride, the second one booked. Public, like the platform's.
  "GET /slots": (request, response) => {
    const query = new URL(request.url, "http://fake").searchParams;
    const date = query.get("date") ?? "";
    if (query.get("observatoryId") !== observatoryId) {
      return error(response, 404, "NOT_FOUND", "No such observatory.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return error(response, 422, "VALIDATION_FAILED", "`date` must be YYYY-MM-DD.");
    }
    const dusk = Date.parse(`${date}T14:00:00.000Z`);
    send(
      response,
      200,
      zListSlotsResponse.parse({
        observatoryId,
        date,
        items: Array.from({ length: 9 }, (_, index) => {
          const startAt = dusk + index * 40 * 60_000;
          return {
            observatoryId,
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(startAt + 30 * 60_000).toISOString(),
            durationMinutes: 30,
            available: index !== 1,
            priceMinor: 4500,
            currency: "GEL",
            unavailableReason: index === 1 ? "ALREADY_BOOKED" : null,
          };
        }),
      }),
    );
  },
  "POST /bookings": createBooking,
  // As the platform: public, and 404 for an observatory it does not list.
  "GET /targets/visibility": (request, response) => {
    const query = new URL(request.url, "http://fake").searchParams;
    if (query.get("observatoryId") !== observatoryId)
      return error(response, 404, "NOT_FOUND", "No such observatory.");
    const startAt = query.get("startAt") ?? "";
    const durationMinutes = Number(query.get("durationMinutes"));
    if (Number.isNaN(Date.parse(startAt)) || !Number.isInteger(durationMinutes))
      return error(response, 422, "VALIDATION_FAILED", "startAt and durationMinutes.");
    send(response, 200, slotTargets(startAt, durationMinutes));
  },
  // As the platform: latest slot first, the id as the tiebreak, keyset on the id.
  "GET /bookings": (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const cursor = new URL(request.url, "http://fake").searchParams.get("cursor");
    const mine = bookingsOf(request, user).sort(
      (left, right) =>
        right.slotStartAt.localeCompare(left.slotStartAt) ||
        right.id.localeCompare(left.id),
    );
    const start = cursor ? mine.findIndex((row) => row.id === cursor) + 1 : 0;
    const rows =
      cursor && start === 0 ? [] : mine.slice(start, start + BOOKINGS_PAGE_SIZE);
    const hasMore = start + BOOKINGS_PAGE_SIZE < mine.length && rows.length > 0;
    send(
      response,
      200,
      zListBookingsResponse.parse({
        items: rows,
        page: { hasMore, nextCursor: hasMore ? rows.at(-1).id : null },
      }),
    );
  },
  // As the platform: the caller's missions by requestedAt desc, keyset on the id.
  "GET /missions": (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const cursor = new URL(request.url, "http://fake").searchParams.get("cursor");
    const mine = missions
      .filter((row) => row.userId === user.id)
      .sort(
        (left, right) =>
          right.requestedAt.localeCompare(left.requestedAt) ||
          right.id.localeCompare(left.id),
      );
    const start = cursor ? mine.findIndex((row) => row.id === cursor) + 1 : 0;
    const rows = cursor && start === 0 ? [] : mine.slice(start, start + PAGE_SIZE);
    const hasMore = start + PAGE_SIZE < mine.length && rows.length > 0;
    send(
      response,
      200,
      zListMissionsResponse.parse({
        items: rows,
        page: { hasMore, nextCursor: hasMore ? rows.at(-1).id : null },
      }),
    );
  },
  "GET /captures": (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const cursor = new URL(request.url, "http://fake").searchParams.get("cursor");
    const mine = captures.filter((row) => row.capture.userId === user.id);
    // As the platform: a cursor it does not know starts nowhere, not at the top.
    const start = cursor ? mine.findIndex((row) => row.capture.id === cursor) + 1 : 0;
    const rows = cursor && start === 0 ? [] : mine.slice(start, start + PAGE_SIZE);
    const hasMore = start + PAGE_SIZE < mine.length && rows.length > 0;
    send(
      response,
      200,
      zListCapturesResponse.parse({
        items: rows.map(withThumbnail),
        page: { hasMore, nextCursor: hasMore ? rows.at(-1).capture.id : null },
      }),
    );
  },
  [`GET /admin/observatories/${observatoryId}/state`]: (request, response) => {
    if (operator(request, response)) send(response, 200, observatoryState());
  },
  [`POST /admin/observatories/${observatoryId}/mode`]: async (request, response) => {
    if (!operator(request, response)) return;
    const body = zSetObservatoryModeRequest.safeParse(await json(request));
    if (
      !body.success ||
      (body.data.mode === "REAL" && !body.data.attendedOperatorPresent)
    ) {
      return error(
        response,
        422,
        "VALIDATION_FAILED",
        "REAL needs attended presence and a reason.",
      );
    }
    observatory.mode = body.data.mode;
    send(response, 200, observatoryState());
  },
  "POST /admin/override": async (request, response) => {
    if (!operator(request, response)) return;
    const body = zOperatorOverrideRequest.safeParse(await json(request));
    if (!body.success)
      return error(response, 422, "VALIDATION_FAILED", "Malformed override.");
    if (body.data.missionId !== observatory.activeMissionId) {
      return error(response, 409, "MISSION_NOT_ACTIVE", "No such live mission.");
    }
    if (body.data.type === "PARK") setTimeout(() => (observatory.parked = true), 1500);
    const issuedAt = new Date();
    send(
      response,
      202,
      zMissionCommandAccepted.parse({
        commandId: randomUUID(),
        missionId: body.data.missionId,
        type: body.data.type,
        issuedAt: issuedAt.toISOString(),
        expiresAt: new Date(issuedAt.getTime() + 30_000).toISOString(),
        status: "ACCEPTED",
        rejectionReason: null,
      }),
    );
  },
  "GET /admin/missions": (request, response) => {
    if (!operator(request, response)) return;
    const query = new URL(request.url, "http://fake").searchParams;
    const state = query.get("state");
    const rows = state ? missions.filter((row) => row.state === state) : missions;
    send(
      response,
      200,
      zAdminListMissionsResponse.parse(paginate(rows, query.get("cursor"))),
    );
  },
  "GET /admin/logs": (request, response) => {
    if (!operator(request, response)) return;
    const query = new URL(request.url, "http://fake").searchParams;
    const missionFilter = query.get("missionId");
    const category = query.get("category");
    const rows = auditEvents.filter(
      (row) =>
        (!missionFilter || row.missionId === missionFilter) &&
        (!category || row.category === category),
    );
    send(
      response,
      200,
      zAdminListAuditEventsResponse.parse(paginate(rows, query.get("cursor"))),
    );
  },
  "GET /targets/tonight": (request, response) => {
    const query = new URL(request.url, "http://fake").searchParams;
    if (query.get("observatoryId") !== observatoryId) {
      return error(response, 404, "NOT_FOUND", "No such observatory.");
    }
    send(response, 200, tonightTargets());
  },
  [`GET /observatories/${observatoryId}/state`]: (_request, response) =>
    send(response, 200, publicStatus()),
  [`GET /observatories/${observatoryId}/conditions`]: (_request, response) =>
    send(response, 200, viewingConditions()),
  "GET /me": (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    send(response, 200, zUser.parse(user));
  },
  // Platform ADR-048, as the browser sees it: the start sends it on (here, straight
  // to the callback, through the website's /api path as Google would), and the
  // callback signs the observer in or lands on sign-in with error=google.
  "GET /auth/google/start": (request, response) => {
    const query = new URL(request.url, "http://fake").searchParams;
    const locale = query.get("locale") === "ka" ? "ka" : "en";
    const outcome = query.get("outcome") === "refused" ? "refused" : "ok";
    response.writeHead(303, {
      location: `/api/auth/google/callback?code=fake&state=${outcome}&locale=${locale}`,
      "cache-control": "no-store",
    });
    response.end();
  },
  "GET /auth/google/callback": (request, response) => {
    const query = new URL(request.url, "http://fake").searchParams;
    const locale = query.get("locale") === "ka" ? "ka" : "en";
    if (query.get("state") !== "ok") {
      response.writeHead(303, { location: `/${locale}/sign-in?error=google` });
      return response.end();
    }
    const token = randomUUID();
    const csrf = randomUUID();
    sessions.set(token, { user: users.get("observer@darkview.test"), csrf });
    response.writeHead(303, {
      location: `/${locale}/app`,
      "set-cookie": [
        `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
        `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
      ],
    });
    response.end();
  },
  "POST /auth/sign-in": async (request, response) => {
    const body = await json(request);
    const user = users.get(body?.email);
    if (!user || body?.password !== (passwords.get(body.email) ?? fakePassword)) {
      const pending = [...pendingVerifications.values()].find(
        (entry) => entry.user.email === body?.email && entry.password === body?.password,
      );
      if (pending) return error(response, 403, "EMAIL_UNVERIFIED", "Verify your email first.");
      return error(response, 401, "UNAUTHENTICATED", "Email or password is incorrect.");
    }
    const token = randomUUID();
    const csrf = randomUUID();
    sessions.set(token, { user, csrf });
    send(response, 200, zUser.parse(user), {
      "set-cookie": [
        `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
        `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
      ],
    });
  },
  // ADR-016: 202 whether or not the address holds an account, and no session until
  // the address is verified.
  "POST /auth/register": async (request, response) => {
    const body = zRegisterRequest.safeParse(await json(request));
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "Name, email and password.");
    }
    const { displayName, email, locale, password } = body.data;
    // Platform ADR-049, as the demo answers it: an address on demo.test is verified at
    // once and signed in, 200 with the user and the session cookies.
    if (!users.has(email) && email.endsWith("@demo.test")) {
      const user = zUser.parse({
        id: randomUUID(),
        email,
        displayName,
        role: "USER",
        locale,
        createdAt: new Date().toISOString(),
      });
      users.set(email, user);
      passwords.set(email, password);
      const token = randomUUID();
      const csrf = randomUUID();
      sessions.set(token, { user, csrf });
      return send(response, 200, user, {
        "set-cookie": [
          `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
          `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
        ],
      });
    }
    if (!users.has(email)) {
      const token = randomUUID();
      pendingVerifications.set(token, {
        password,
        user: zUser.parse({
          id: randomUUID(),
          email,
          displayName,
          role: "USER",
          locale,
          createdAt: new Date().toISOString(),
        }),
      });
      console.log(
        `[fake-platform] verify ${email}: ${appOrigin}/${locale}/verify-email/${token}`,
      );
    }
    send(response, 202, undefined);
  },
  "POST /auth/verify-email": async (request, response) => {
    const body = zVerifyEmailRequest.safeParse(await json(request));
    if (!body.success) return error(response, 422, "VALIDATION_FAILED", "A token.");
    const change = pendingEmailChanges.get(body.data.token);
    if (change) {
      // ADR-042: the account moves, every session ends, and the opener is signed in.
      pendingEmailChanges.delete(body.data.token);
      const user = [...users.values()].find((row) => row.id === change.userId);
      const password = passwords.get(user.email) ?? fakePassword;
      users.delete(user.email);
      passwords.delete(user.email);
      user.email = change.email;
      users.set(user.email, user);
      passwords.set(user.email, password);
      for (const [token, session] of sessions) {
        if (session.user.id === user.id) sessions.delete(token);
      }
      const token = randomUUID();
      const csrf = randomUUID();
      sessions.set(token, { user, csrf });
      return send(response, 200, zUser.parse(user), {
        "set-cookie": [
          `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
          `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
        ],
      });
    }
    const pending = pendingVerifications.get(body.data.token);
    if (!pending) return error(response, 403, "FORBIDDEN", "This link is not valid.");
    pendingVerifications.delete(body.data.token);
    users.set(pending.user.email, pending.user);
    passwords.set(pending.user.email, pending.password);
    const token = randomUUID();
    const csrf = randomUUID();
    sessions.set(token, { user: pending.user, csrf });
    send(response, 200, zUser.parse(pending.user), {
      "set-cookie": [
        `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
        `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
      ],
    });
  },
  // ADR-040: 202 whatever the address; a link only for an account.
  "POST /auth/password-reset": async (request, response) => {
    const body = zPasswordResetRequest.safeParse(await json(request));
    if (!body.success) return error(response, 422, "VALIDATION_FAILED", "An email.");
    const { email, locale } = body.data;
    if (users.has(email)) {
      const token = resetToken(email);
      pendingResets.set(token, email);
      console.log(
        `[fake-platform] reset ${email}: ${appOrigin}/${locale}/reset-password/${token}`,
      );
    }
    send(response, 202, undefined);
  },
  "POST /auth/password-reset/confirm": async (request, response) => {
    const body = zPasswordResetConfirmRequest.safeParse(await json(request));
    // As the platform does: the refused fields by path, never their values.
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "A token and a password.", {
        fields: [...new Set(body.error.issues.map((issue) => issue.path.join(".")))],
      });
    }
    const email = pendingResets.get(body.data.token);
    if (!email) {
      return error(
        response,
        404,
        "NOT_FOUND",
        "The reset link is invalid, used or expired.",
      );
    }
    pendingResets.delete(body.data.token);
    passwords.set(email, body.data.password);
    const user = users.get(email);
    for (const [token, session] of sessions) {
      if (session.user.id === user.id) sessions.delete(token);
    }
    const token = randomUUID();
    const csrf = randomUUID();
    sessions.set(token, { user, csrf });
    send(response, 200, zUser.parse(user), {
      "set-cookie": [
        `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax`,
        `${csrfCookie}=${csrf}; Path=/; SameSite=Lax`,
      ],
    });
  },
  // ADR-042: the name and the language the platform writes in.
  "PATCH /me": async (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const body = zUpdateProfileRequest.safeParse(await json(request));
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "UpdateProfileRequest.", {
        fields: [...new Set(body.error.issues.map((issue) => issue.path.join(".")))],
      });
    }
    const { displayName, locale } = body.data;
    if (displayName === undefined && locale === undefined) {
      return error(response, 422, "VALIDATION_FAILED", "Name a field.");
    }
    if (displayName !== undefined) {
      if (displayName.trim().length < 2) {
        return error(response, 422, "VALIDATION_FAILED", "Too short.", {
          fields: ["displayName"],
        });
      }
      user.displayName = displayName.trim();
    }
    if (locale !== undefined) user.locale = locale;
    send(response, 200, zUser.parse(user));
  },
  // ADR-042: 202 whether or not the address is free; a link only when it is.
  "POST /me/email": async (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const body = zChangeEmailRequest.safeParse(await json(request));
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "ChangeEmailRequest.", {
        fields: [...new Set(body.error.issues.map((issue) => issue.path.join(".")))],
      });
    }
    if (body.data.currentPassword !== (passwords.get(user.email) ?? fakePassword)) {
      return error(response, 422, "VALIDATION_FAILED", "Wrong current password.", {
        fields: ["currentPassword"],
      });
    }
    const email = body.data.email.trim().toLowerCase();
    if (email === user.email) {
      return error(response, 422, "VALIDATION_FAILED", "Already the address.", {
        fields: ["email"],
      });
    }
    if (!users.has(email)) {
      const token = emailChangeToken(email);
      pendingEmailChanges.set(token, { userId: user.id, email });
      console.log(
        `[fake-platform] change ${user.email} -> ${email}: ${appOrigin}/${user.locale}/verify-email/${token}`,
      );
    }
    send(response, 202, undefined);
  },
  // ADR-040: this session stays, every other ends.
  "POST /me/password": async (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const body = zChangePasswordRequest.safeParse(await json(request));
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "ChangePasswordRequest.", {
        fields: [...new Set(body.error.issues.map((issue) => issue.path.join(".")))],
      });
    }
    if (body.data.currentPassword !== (passwords.get(user.email) ?? fakePassword)) {
      return error(response, 422, "VALIDATION_FAILED", "Wrong current password.", {
        fields: ["currentPassword"],
      });
    }
    passwords.set(user.email, body.data.password);
    const current = cookiesOf(request)[sessionCookie];
    for (const [token, session] of sessions) {
      if (session.user.id === user.id && token !== current) sessions.delete(token);
    }
    send(response, 204, undefined);
  },
  // ADR-044: 409 with the blockers the platform would name, else the account is gone.
  // The fake knows the bookings and the live mission, so it names those three.
  "DELETE /me": async (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    const body = zDeleteAccountRequest.safeParse(await json(request));
    if (!body.success) {
      return error(response, 422, "VALIDATION_FAILED", "DeleteAccountRequest.", {
        fields: [...new Set(body.error.issues.map((issue) => issue.path.join(".")))],
      });
    }
    if (body.data.currentPassword !== (passwords.get(user.email) ?? fakePassword)) {
      return error(response, 422, "VALIDATION_FAILED", "Wrong current password.", {
        fields: ["currentPassword"],
      });
    }
    const now = Date.now();
    const mine = bookingsOf(request, user);
    const blockers = [];
    if (user.role === "OPERATOR") blockers.push("OPERATOR");
    if (user.id === userId) blockers.push("LIVE_MISSION");
    if (
      mine.some(
        (row) =>
          row.status === "CONFIRMED" &&
          Date.parse(row.slotStartAt) + row.durationMinutes * 60_000 > now,
      )
    )
      blockers.push("UPCOMING_BOOKING");
    if (
      mine.some(
        (row) =>
          row.status === "PENDING_PAYMENT" &&
          row.paymentIntent?.expiresAt &&
          Date.parse(row.paymentIntent.expiresAt) > now,
      )
    )
      blockers.push("HELD_BOOKING");
    if (mine.some((row) => row.entitlement?.status === "OPEN"))
      blockers.push("OPEN_ENTITLEMENT");
    if (blockers.length > 0) {
      return error(
        response,
        409,
        "CONFLICT",
        "The account has something to settle first.",
        {
          blockers,
        },
      );
    }
    users.delete(user.email);
    for (const [token, session] of sessions) {
      if (session.user.id === user.id) sessions.delete(token);
    }
    send(response, 204, undefined, {
      "set-cookie": [
        `${sessionCookie}=; Path=/; Max-Age=0`,
        `${csrfCookie}=; Path=/; Max-Age=0`,
      ],
    });
  },
  "POST /auth/sign-out": (request, response) => {
    if (!sessionUser(request))
      return error(response, 401, "UNAUTHENTICATED", "No session.");
    sessions.delete(cookiesOf(request)[sessionCookie]);
    send(response, 204, undefined, {
      "set-cookie": [
        `${sessionCookie}=; Path=/; Max-Age=0`,
        `${csrfCookie}=; Path=/; Max-Age=0`,
      ],
    });
  },
};

async function cancelMission(request, response, id) {
  if (!operator(request, response)) return;
  const body = zAdminCancelMissionRequest.safeParse(await json(request));
  if (!body.success) {
    return error(response, 422, "VALIDATION_FAILED", "A reason and a resolution.");
  }
  const mission = missions.find((row) => row.id === id);
  if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");

  mission.state = "CANCELLED";
  mission.endedAt = new Date().toISOString();
  if (observatory.activeMissionId === id) observatory.activeMissionId = null;
  auditEvents.unshift({
    id: randomUUID(),
    at: mission.endedAt,
    category: "MISSION",
    action: "mission.cancelled",
    actorUserId: sessionUser(request).id,
    missionId: id,
    commandId: null,
    detail: { reason: body.data.reason, resolution: body.data.resolution },
  });
  send(response, 200, mission);
}

// Phase 4 slice 2: the live session, the mission channel and the stream, as the platform's
// API (POST /missions/{id}/start) and realtime service (/ws/mission/{id},
// /stream/mission/{id}) answer them. The web app proxies both realtime paths here.
//
// A test picks a scenario with the `fake_live` cookie, per browser context, so parallel
// tests never share one: slow, error, offline, hold, drop, expire, forbidden, open, and
// the observation stopped short: not-visible, hardware, cancelled, failed, heartbeat. The
// fake does not rotate a session on a second start as the platform does, because every
// parallel test signs in as the same observer and would revoke the others'.
const liveSessions = new Map();
const streamTokens = new Map();
const LIVE_STATES = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
];
const SESSION_MINUTES = 30;
const STREAM_TTL_SECONDS = 300;

// One JPEG, drawn by code and deterministic: a field of points standing in for a simulated
// camera frame. Only ever offered with mode SIMULATED.
const simulatedJpeg = Buffer.from(
  "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",
  "base64",
);

async function startSession(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = missions.find((row) => row.id === id && row.userId === user.id);
  if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
  const scenario = cookiesOf(request).fake_live ?? null;

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1500));
  if (scenario === "error") return error(response, 500, "INTERNAL", "Simulated failure.");

  const scheduled = mission.state === "SCHEDULED";
  // As ADR-018: no start before the booked slot opens. `open` stands in for a slot that has.
  if (scheduled && scenario !== "open") {
    return error(
      response,
      409,
      "MISSION_NOT_ACTIVE",
      "The booked slot has not started yet.",
    );
  }
  if (!scheduled && !LIVE_STATES.includes(mission.state)) {
    return error(response, 409, "MISSION_NOT_ACTIVE", "No live session to open.");
  }

  const issuedAt = new Date();
  const expiresAt =
    scenario === "expire"
      ? new Date(issuedAt.getTime() + 4_000)
      : scenario === "open"
        ? new Date(Date.parse(mission.scheduledStartAt) + SESSION_MINUTES * 60_000)
        : new Date(issuedAt.getTime() + SESSION_MINUTES * 60_000);
  const session = zStartMissionSessionResponse.parse({
    sessionId: randomUUID(),
    missionId: mission.id,
    userId: user.id,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    missionChannelUrl: `/ws/mission/${mission.id}`,
    allowedCommands: ["NUDGE", "CAPTURE", "RECENTER", "ABORT"],
  });
  liveSessions.set(session.sessionId, { ...session, scenario });
  send(response, 200, session);
}

function channelMessage(body) {
  return zMissionChannelMessage.parse({
    messageId: randomUUID(),
    sentAt: new Date().toISOString(),
    ...body,
  });
}

// What the channel says to one subscriber, by scenario. Every message is parsed by the
// generated validator on its way out.
function subscribed(socket, mission, session) {
  // Slice 3: a command's verdict comes back on the channel of the session that sent it.
  session.sockets ??= new Set();
  session.sockets.add(socket);
  socket.on("close", () => session.sockets.delete(socket));
  const say = (body) =>
    socket.sendJson(channelMessage({ missionId: mission.id, ...body }));
  const state = (value, failureReason = null) =>
    say({ type: "MISSION_STATE", state: value, failureReason, remainingSeconds: null });
  // `pointing` as the realtime service rounds it, to 0.1°; null when there is none.
  const telemetry = (link, pointing = null) =>
    say({
      type: "MISSION_TELEMETRY",
      mode: "SIMULATED",
      link,
      tracking: link === "ONLINE",
      centeringIteration: null,
      residualArcminutes: null,
      nudgeUsedDegrees: null,
      ambientTemperatureC: null,
      pointing,
    });
  const at = (altitudeDegrees, azimuthDegrees) => ({ altitudeDegrees, azimuthDegrees });

  // A4: an observation stopped short, as the channel reports it after the session opened.
  const stopped = {
    "not-visible": ["NOT_VISIBLE", "TARGET_SET_BELOW_LIMIT"],
    hardware: ["HARDWARE_ERROR", "MOUNT_FAULT"],
    cancelled: ["CANCELLED", "OPERATOR_ABORT"],
    failed: ["FAILED", "CENTERING_ITERATIONS_EXHAUSTED"],
  }[session.scenario];
  if (stopped) {
    state(mission.state);
    telemetry("ONLINE", at(18, 290));
    return setTimeout(() => state(...stopped), 300);
  }

  switch (session.scenario) {
    // Heartbeat loss: the link goes, then the cloud closes the mission out, as the
    // platform's realtime service does (link/prisma-store.ts, AGENT_LINK_LOST).
    case "heartbeat":
      state(mission.state);
      telemetry("OFFLINE");
      return setTimeout(() => state("FAILED", "AGENT_LINK_LOST"), 300);
    case "hold":
      state("WEATHER_HOLD", "WEATHER_UNSAFE");
      return telemetry("ONLINE", at(18, 290));
    case "offline":
      state(mission.state);
      return telemetry("OFFLINE");
    case "drop":
      state(mission.state);
      return setTimeout(() => socket.destroy(), 300);
    case "open": {
      // The mount leaves park, travels to Saturn (tonight 38°, 160°) and settles on it.
      state("PREPARING");
      telemetry("ONLINE", null);
      const steps = [
        () => state("SLEWING"),
        () => telemetry("ONLINE", at(5, 100)),
        () => telemetry("ONLINE", at(20, 130)),
        () => telemetry("ONLINE", at(33.4, 152.6)),
        () => state("CENTERING"),
        () => telemetry("ONLINE", at(38, 160)),
      ];
      const timers = steps.map((step, index) => setTimeout(step, 800 + index * 400));
      return socket.on("close", () => timers.forEach(clearTimeout));
    }
    default: {
      state(mission.state);
      telemetry("ONLINE", at(18, 290));
      const token = randomUUID();
      const expiresAt = new Date(
        Math.min(Date.now() + STREAM_TTL_SECONDS * 1000, Date.parse(session.expiresAt)),
      );
      streamTokens.set(token, {
        missionId: mission.id,
        userId: session.userId,
        expiresAt,
      });
      say({
        type: "MISSION_STREAM",
        streamUrl: `${appOrigin}/stream/mission/${mission.id}?t=${token}`,
        encoding: "JPEG",
        mode: "SIMULATED",
        expiresAt: expiresAt.toISOString(),
      });
    }
  }
}

// Phase 4 slice 3: `submitMissionCommand`, as the platform's API answers it, and the
// agent's one verdict on the channel. The `fake_command` cookie picks the outcome for this
// browser context: unset, the agent accepts; `refuse`, it refuses a nudge past its limit;
// `cloud`, the cloud refuses it first (409); `silent`, no verdict ever comes.
// Every parallel test is the same user on the same mission, and the platform relays a
// verdict to the newest session, which may be another test's. A test that sets the
// `fake_room` cookie hears only the verdicts on the commands it sent itself.
const COMMAND_TTL_SECONDS = 15;

async function submitCommand(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = missions.find((row) => row.id === id && row.userId === user.id);
  if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
  const body = zSubmitMissionCommandBody.safeParse(await json(request));
  if (!body.success)
    return error(
      response,
      422,
      "VALIDATION_FAILED",
      "MissionCommandRequest is malformed.",
    );

  const session = [...liveSessions.values()]
    .filter(
      (candidate) =>
        candidate.missionId === id &&
        candidate.userId === user.id &&
        Date.parse(candidate.expiresAt) > Date.now(),
    )
    .at(-1);
  if (!session)
    return error(response, 409, "MISSION_NOT_ACTIVE", "No session owns this mission.");

  const outcome = cookiesOf(request).fake_command ?? null;
  if (outcome === "cloud")
    return error(response, 409, "SAFETY_REFUSED", "MAX_ALT_SAFE is UNMEASURED.", {
      rejectionReason: "SAFETY_ENVELOPE_UNMEASURED",
    });

  const { type } = body.data;
  const issuedAt = new Date();
  const accepted = zSubmitMissionCommandResponse.parse({
    commandId: randomUUID(),
    missionId: id,
    type: type === "RECENTER" ? "GOTO" : type,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(
      issuedAt.getTime() + (outcome === "silent" ? 1 : COMMAND_TTL_SECONDS) * 1000,
    ).toISOString(),
    status: "ACCEPTED",
  });
  send(response, 202, accepted);
  if (outcome === "silent") return;

  const room = cookiesOf(request).fake_room ?? null;
  const sockets = room
    ? [...liveSessions.values()]
        .filter((candidate) => candidate.missionId === id)
        .flatMap((candidate) => [...(candidate.sockets ?? [])])
        .filter((socket) => socket.room === room)
    : [...(session.sockets ?? [])].filter((socket) => !socket.room);
  const say = (body) => {
    for (const socket of sockets)
      socket.sendJson(channelMessage({ missionId: id, ...body }));
  };
  const refused = outcome === "refuse" && type === "NUDGE";
  setTimeout(() => {
    say({
      type: "MISSION_COMMAND_RESULT",
      commandId: accepted.commandId,
      status: refused ? "REJECTED" : "ACCEPTED",
      rejectionReason: refused ? "SAFETY_NUDGE_LIMIT_EXCEEDED" : null,
    });
    if (refused) return;
    const state = (value, failureReason = null) =>
      say({ type: "MISSION_STATE", state: value, failureReason, remainingSeconds: null });
    if (type === "CAPTURE") {
      state("CAPTURING");
      setTimeout(() => state("OBSERVING"), 1200);
    }
    if (type === "ABORT") state("CANCELLED", "CUSTOMER_CANCELLED");
  }, 300);
}

// Phase 4 slice 4: the owner opens or closes the session to observers, as
// `setMissionObservation` answers. The change is the answer's only: the mission row is
// shared by every parallel test and stays as it is.
async function setObservation(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = missions.find((row) => row.id === id && row.userId === user.id);
  if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
  const body = zSetMissionObservationBody.safeParse(await json(request));
  if (!body.success)
    return error(
      response,
      422,
      "VALIDATION_FAILED",
      "MissionObservationSettings is malformed.",
    );
  if (!LIVE_STATES.includes(mission.state))
    return error(
      response,
      409,
      "MISSION_NOT_ACTIVE",
      `A mission in ${mission.state} has no session to open.`,
    );
  const { observable } = body.data;
  send(
    response,
    200,
    zSetMissionObservationResponse.parse({
      ...mission,
      observable,
      observerCapacity: 5,
      observerCount: observable ? (mission.observerCount ?? 0) : 0,
    }),
  );
}

// Phase 4 slice 5: watching somebody else's session, as `getMissionWatchView`,
// `purchaseObserverPack`, `joinMissionAsObserver` and `leaveMissionAsObserver` answer, and
// the channel admitting an attached seat. Two sessions Nino has opened to watchers, kept
// out of `missions` so no list, baseline or operator view changes: one with seats free,
// one with every seat sold.
//
// The packs and seats belong to the session that bought them, as the booking changes do,
// so a test that buys signs in on a session of its own and parallel tests never share a
// seat. The `fake_watch` cookie picks a scenario per browser context: `settling`, the
// checkout's payment settles two joins late; `offline`, the agent is not connected;
// `closed`, Nino closes the session to watchers a moment after the channel opens.
//
// The checkout is the platform's as docs/platform-requests/observer-pack-checkout.md
// asks for it: an Observer Pack payment carries a redirectUrl, and the checkout returns
// to the watch page in the account's locale.
const ninoId = fakeAccounts["nino@darkview.test"].id;
const watchedMissions = [
  {
    id: "23000000-0000-4000-8000-000000000004",
    userId: ninoId,
    bookingId: "54000000-0000-4000-8000-000000000004",
    targetId: "30000000-0000-4000-8000-000000000006",
    observatoryId,
    state: "OBSERVING",
    failureReason: null,
    mode: "SIMULATED",
    scheduledStartAt: "2026-09-23T20:00:00.000Z",
    requestedAt: "2026-09-23T19:40:00.000Z",
    startedAt: "2026-09-23T20:00:00.000Z",
    endedAt: null,
    captureIds: [],
    observable: true,
    observerCapacity: 5,
    observerCount: 2,
  },
  {
    id: "24000000-0000-4000-8000-000000000005",
    userId: ninoId,
    bookingId: "55000000-0000-4000-8000-000000000005",
    targetId: "30000000-0000-4000-8000-000000000006",
    observatoryId,
    state: "OBSERVING",
    failureReason: null,
    mode: "SIMULATED",
    scheduledStartAt: "2026-09-23T20:00:00.000Z",
    requestedAt: "2026-09-23T19:40:00.000Z",
    startedAt: "2026-09-23T20:00:00.000Z",
    endedAt: null,
    captureIds: [],
    observable: true,
    observerCapacity: 5,
    observerCount: 5,
  },
];
// session → missionId → { pack, seat, closed, settlesAfter }
const watchSeats = new Map();
const OBSERVER_PACK_PRICE_MINOR = 1500;

function watchable(id) {
  return [...missions, ...watchedMissions].find((row) => row.id === id) ?? null;
}

function seatOf(request, id) {
  const session = cookiesOf(request)[sessionCookie];
  if (!watchSeats.has(session)) watchSeats.set(session, new Map());
  const seats = watchSeats.get(session);
  if (!seats.has(id)) seats.set(id, { pack: null, seat: null, closed: false });
  return seats.get(id);
}

/** As the platform: open while the owner has opened it, the mission is live, and this
 * session has not seen Nino close it. */
function openToWatchers(mission, seat) {
  return (
    Boolean(mission.observable) && LIVE_STATES.includes(mission.state) && !seat.closed
  );
}

function watchedMission(mission, seat) {
  return {
    ...mission,
    observable: openToWatchers(mission, seat),
    observerCount: (mission.observerCount ?? 0) + (seat.seat ? 1 : 0),
  };
}

function getWatchView(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = watchable(id);
  const seat = mission && seatOf(request, id);
  // The owner, a seat attached, a paid pack in any state (ADR-045), or anybody while it
  // is open: everyone else, the same 404.
  const paid = seat?.pack?.observerPack.status === "PAID";
  if (
    !mission ||
    (mission.userId !== user.id && !seat.seat && !paid && !openToWatchers(mission, seat))
  )
    return error(response, 404, "NOT_FOUND", "No such mission.");
  const owner = [...users.values()].find((row) => row.id === mission.userId);
  const shown = watchedMission(mission, seat);
  send(
    response,
    200,
    zGetMissionWatchViewResponse.parse({
      mission: shown,
      target: targets.items.find((row) => row.id === mission.targetId),
      observatory: observatories.items[0],
      ownerDisplayName: owner?.displayName ?? null,
      observerCount: shown.observerCount,
      myObserverSeat: seat.seat,
      myObserverPack:
        mission.userId === user.id ? null : (seat.pack?.observerPack ?? null),
    }),
  );
}

/** The refusals purchase and join share, in the platform's order; null when there is none. */
function seatRefusal(response, mission, seat, user) {
  if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
  if (mission.userId === user.id)
    return error(
      response,
      409,
      "CONFLICT",
      "The controller cannot observe their own session.",
    );
  if (!LIVE_STATES.includes(mission.state))
    return error(response, 409, "MISSION_NOT_ACTIVE", "Nothing to observe.");
  if (!openToWatchers(mission, seat))
    return error(
      response,
      403,
      "MISSION_NOT_OBSERVABLE",
      "The controller has not opened this session to observers.",
    );
  return null;
}

function purchasePack(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = watchable(id);
  const seat = mission && seatOf(request, id);
  if (seatRefusal(response, mission, seat, user)) return;
  // One pack per person per mission: asking again returns it, paid or still held.
  if (seat.pack) return send(response, 201, seat.pack);
  if ((mission.observerCount ?? 0) >= mission.observerCapacity)
    return error(
      response,
      409,
      "OBSERVER_CAPACITY_REACHED",
      `All ${mission.observerCapacity} observer seats are taken.`,
    );
  const paymentId = randomUUID();
  const holdExpiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  seat.pack = zPurchaseObserverPackResponse.parse({
    observerPack: {
      id: randomUUID(),
      missionId: id,
      userId: user.id,
      status: "PENDING_PAYMENT",
      priceMinor: OBSERVER_PACK_PRICE_MINOR,
      currency: "GEL",
      paymentId,
      holdExpiresAt,
      refundedMinor: null,
      refundOwedMinor: null,
      createdAt: new Date().toISOString(),
    },
    paymentIntent: {
      paymentId,
      provider: "SANDBOX",
      status: "PENDING",
      redirectUrl: `${appOrigin}/api/payments/${paymentId}/sandbox-checkout`,
      expiresAt: holdExpiresAt,
    },
  });
  payments.set(paymentId, {
    session: cookiesOf(request)[sessionCookie],
    missionId: id,
    locale: user.locale,
    settling: cookiesOf(request).fake_watch === "settling",
  });
  send(response, 201, seat.pack);
}

/** The checkout's answer for an Observer Pack: the pack paid, or released. */
function settlePack(payment, result) {
  const seat = watchSeats.get(payment.session).get(payment.missionId);
  const paid = result === "PAID";
  seat.pack = zPurchaseObserverPackResponse.parse({
    observerPack: {
      ...seat.pack.observerPack,
      status: paid ? "PAID" : "CANCELLED",
      holdExpiresAt: null,
    },
    paymentIntent: { ...seat.pack.paymentIntent, status: paid ? "CAPTURED" : "FAILED" },
  });
  if (!paid) seat.pack = null;
  // `settling`: the provider's callback is late, so the next two joins still answer 402.
  seat.settlesAfter = paid && payment.settling ? 2 : 0;
}

function joinSeat(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  const mission = watchable(id);
  const seat = mission && seatOf(request, id);
  if (seatRefusal(response, mission, seat, user)) return;
  if (seat.pack?.observerPack.status !== "PAID" || seat.settlesAfter > 0) {
    if (seat.settlesAfter > 0) seat.settlesAfter -= 1;
    return error(
      response,
      402,
      "PAYMENT_REQUIRED",
      "An Observer Pack seat for this session has not been paid for.",
    );
  }
  if (!seat.seat) {
    if ((mission.observerCount ?? 0) >= mission.observerCapacity)
      return error(
        response,
        409,
        "OBSERVER_CAPACITY_REACHED",
        `All ${mission.observerCapacity} observer seats are taken.`,
      );
    seat.seat = zJoinMissionAsObserverResponse.parse({
      id: randomUUID(),
      missionId: id,
      userId: user.id,
      joinedAt: new Date().toISOString(),
      leftAt: null,
    });
  }
  send(response, 201, seat.seat);
}

/** Leaving frees the connection, never the seat; idempotent, as the platform's. */
function leaveSeat(request, response, id) {
  const user = sessionUser(request);
  if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
  if (!watchable(id)) return error(response, 404, "NOT_FOUND", "No such mission.");
  seatOf(request, id).seat = null;
  send(response, 204);
}

/** An observer's subscribe: admitted on an attached seat, with nothing to command. */
function subscribedObserver(socket, mission, user, request) {
  const seat = seatOf(request, mission.id);
  const scenario = cookiesOf(request).fake_watch ?? null;
  // The room's channel, as an observer hears it: the state, the telemetry, the stream.
  subscribed(socket, mission, {
    scenario: scenario === "offline" ? "offline" : null,
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_MINUTES * 60_000).toISOString(),
  });
  if (scenario !== "closed") return;
  // Nino closes the session: every seat detached, and the channel hung up. A paid seat
  // is refunded for the time it loses, as ADR-036 does on the sandbox: half, here.
  const timer = setTimeout(() => {
    seat.seat = null;
    seat.closed = true;
    if (seat.pack?.observerPack.status === "PAID") {
      seat.pack = zPurchaseObserverPackResponse.parse({
        ...seat.pack,
        observerPack: {
          ...seat.pack.observerPack,
          refundedMinor: OBSERVER_PACK_PRICE_MINOR / 2,
        },
      });
    }
    socket.close();
  }, 1500);
  socket.on("close", () => clearTimeout(timer));
}

function onChannelMessage(socket, missionId, user, raw, request) {
  let parsed;
  try {
    parsed = zMissionClientMessage.safeParse(JSON.parse(raw));
  } catch {
    parsed = { success: false };
  }
  const refuse = (code, message) => {
    socket.sendJson(channelMessage({ type: "MISSION_ERROR", code, message }));
    socket.close();
  };
  if (!parsed.success) return refuse("BAD_REQUEST", "Message rejected.");
  if (parsed.data.type === "CLIENT_PING") return;

  // An observer states no session (ADR-007): the seat is the grant.
  if (parsed.data.sessionId === null) {
    const mission = watchable(missionId);
    const seat = mission && seatOf(request, missionId);
    if (
      !mission ||
      parsed.data.missionId !== missionId ||
      !seat.seat ||
      !openToWatchers(mission, seat)
    )
      return refuse("FORBIDDEN", "No live session for this mission is yours.");
    return subscribedObserver(socket, mission, user, request);
  }

  const session = liveSessions.get(parsed.data.sessionId);
  const mission = missions.find((row) => row.id === missionId);
  // One refusal for every cause, as the realtime service words it.
  if (
    !mission ||
    !session ||
    session.scenario === "forbidden" ||
    parsed.data.missionId !== missionId ||
    session.missionId !== missionId ||
    session.userId !== user.id ||
    Date.parse(session.expiresAt) <= Date.now()
  ) {
    return refuse("FORBIDDEN", "No live session for this mission is yours.");
  }
  // Which test's room this is, when the test names one (see submitCommand).
  socket.room = cookiesOf(request).fake_room ?? null;
  subscribed(socket, mission, session);
}

// Just enough of RFC 6455 for the channel: text frames, ping, close. No dependency.
function acceptWebSocket(request, socket) {
  const accept = createHash("sha1")
    .update(`${request.headers["sec-websocket-key"]}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
  );

  const frame = (opcode, payload) => {
    const length = payload.length;
    const head =
      length < 126
        ? Buffer.from([0x80 | opcode, length])
        : Buffer.from([0x80 | opcode, 126, length >> 8, length & 0xff]);
    if (!socket.destroyed) socket.write(Buffer.concat([head, payload]));
  };
  socket.sendJson = (body) => frame(0x1, Buffer.from(JSON.stringify(body)));
  socket.close = () => {
    frame(0x8, Buffer.alloc(0));
    socket.end();
  };

  let buffered = Buffer.alloc(0);
  socket.on("data", (chunk) => {
    buffered = Buffer.concat([buffered, chunk]);
    while (buffered.length >= 2) {
      const opcode = buffered[0] & 0x0f;
      let length = buffered[1] & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (buffered.length < 4) return;
        length = buffered.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        return socket.destroy();
      }
      if (buffered.length < offset + 4 + length) return;
      const mask = buffered.subarray(offset, offset + 4);
      const payload = Buffer.from(
        buffered
          .subarray(offset + 4, offset + 4 + length)
          .map((byte, index) => byte ^ mask[index % 4]),
      );
      buffered = buffered.subarray(offset + 4 + length);
      if (opcode === 0x1) socket.emit("text", payload.toString("utf8"));
      else if (opcode === 0x8) socket.close();
      else if (opcode === 0x9) frame(0xa, payload);
    }
  });
  socket.on("error", () => socket.destroy());
}

function upgrade(request, socket) {
  const match = new URL(request.url, "http://fake").pathname.match(
    /^\/ws\/mission\/([0-9a-f-]+)$/,
  );
  if (!match) return socket.destroy();
  // As the realtime service: Origin first, then the session cookie.
  if (request.headers.origin !== appOrigin) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    return socket.destroy();
  }
  const user = sessionUser(request);
  if (!user) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    return socket.destroy();
  }
  acceptWebSocket(request, socket);
  socket.on("text", (raw) => onChannelMessage(socket, match[1], user, raw, request));
}

// GET /stream/mission/{id}?t=…: MJPEG, one frame a second, until the grant lapses. Every
// refusal is the same 404, as the realtime service answers.
function serveStream(request, response, missionId) {
  const url = new URL(request.url, "http://fake");
  const grant = streamTokens.get(url.searchParams.get("t") ?? "");
  const user = sessionUser(request);
  if (
    !grant ||
    !user ||
    grant.missionId !== missionId ||
    grant.userId !== user.id ||
    grant.expiresAt.getTime() <= Date.now()
  ) {
    response.writeHead(404, { "cache-control": "no-store" });
    return response.end();
  }
  const boundary = `fake-${randomUUID()}`;
  response.writeHead(200, {
    "content-type": `multipart/x-mixed-replace; boundary=${boundary}`,
    "cache-control": "no-store, no-transform",
  });
  const write = () =>
    response.write(
      Buffer.concat([
        Buffer.from(
          `--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${simulatedJpeg.length}\r\n\r\n`,
        ),
        simulatedJpeg,
        Buffer.from("\r\n"),
      ]),
    );
  write();
  const every = setInterval(write, 1000);
  const deadline = setTimeout(
    () => response.end(),
    grant.expiresAt.getTime() - Date.now(),
  );
  response.on("close", () => {
    clearInterval(every);
    clearTimeout(deadline);
  });
}

async function patchTarget(request, response, id) {
  if (!operator(request, response)) return;
  const body = zAdminUpdateTargetRequest.safeParse(await json(request));
  if (!body.success) return error(response, 422, "VALIDATION_FAILED", "Malformed patch.");
  const target = targets.items.find((row) => row.id === id);
  if (!target) return error(response, 404, "NOT_FOUND", "No such target.");

  Object.assign(target, body.data);
  send(response, 200, zAdminUpdateTargetResponse.parse(target));
}

http
  .createServer(async (request, response) => {
    const path = new URL(request.url, "http://fake").pathname;
    if (path === "/health") return send(response, 200, { ok: true });
    // ADR-016 §3: every mutation carries this app's Origin, and a missing one is refused.
    if (request.method !== "GET" && request.headers.origin !== appOrigin) {
      return error(response, 403, "FORBIDDEN", "Cross-origin mutation refused.");
    }
    const route = routes[`${request.method} ${path}`];
    if (route) return await route(request, response);

    const cancel = path.match(/^\/admin\/missions\/([0-9a-f-]+)\/cancel$/);
    if (cancel && request.method === "POST") {
      return await cancelMission(request, response, cancel[1]);
    }
    const slug = path.match(/^\/targets\/([a-z0-9-]+)$/);
    if (slug && request.method === "GET") {
      // Enabled only, as the platform answers.
      const found = targets.items.find((row) => row.slug === slug[1] && row.enabled);
      if (!found) return error(response, 404, "NOT_FOUND", "No such target.");
      return send(response, 200, zGetTargetResponse.parse(found));
    }
    const history = path.match(/^\/missions\/([0-9a-f-]+)\/events$/);
    if (history && request.method === "GET") {
      const user = sessionUser(request);
      if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
      // Existence is private: somebody else's mission is the same 404 as none.
      const mission = missions.find(
        (row) => row.id === history[1] && row.userId === user.id,
      );
      if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
      const events = missionEvents[mission.id];
      const cursor = new URL(request.url, "http://fake").searchParams.get("cursor");
      const start = cursor ? events.findIndex((row) => row.id === cursor) + 1 : 0;
      const items = cursor && start === 0 ? [] : events.slice(start, start + PAGE_SIZE);
      const hasMore = start + PAGE_SIZE < events.length && items.length > 0;
      return send(
        response,
        200,
        zListMissionEventsResponse.parse({
          items,
          page: { hasMore, nextCursor: hasMore ? items.at(-1).id : null },
        }),
      );
    }
    const observation = path.match(/^\/missions\/([0-9a-f-]+)\/observation$/);
    if (observation && request.method === "PATCH")
      return await setObservation(request, response, observation[1]);
    const watch = path.match(/^\/missions\/([0-9a-f-]+)\/watch$/);
    if (watch && request.method === "GET")
      return getWatchView(request, response, watch[1]);
    const pack = path.match(/^\/missions\/([0-9a-f-]+)\/observer-pack$/);
    if (pack && request.method === "POST")
      return purchasePack(request, response, pack[1]);
    const observers = path.match(/^\/missions\/([0-9a-f-]+)\/observers$/);
    if (observers && request.method === "POST")
      return joinSeat(request, response, observers[1]);
    if (observers && request.method === "DELETE")
      return leaveSeat(request, response, observers[1]);
    const command = path.match(/^\/missions\/([0-9a-f-]+)\/command$/);
    if (command && request.method === "POST")
      return await submitCommand(request, response, command[1]);
    const start = path.match(/^\/missions\/([0-9a-f-]+)\/start$/);
    if (start && request.method === "POST")
      return await startSession(request, response, start[1]);
    const stream = path.match(/^\/stream\/mission\/([0-9a-f-]+)$/);
    if (stream && request.method === "GET")
      return serveStream(request, response, stream[1]);

    const checkout = path.match(/^\/payments\/([0-9a-f-]+)\/sandbox-checkout$/);
    if (checkout && ["GET", "POST"].includes(request.method))
      return await sandboxCheckout(request, response, checkout[1]);
    const reschedule = path.match(/^\/bookings\/([0-9a-f-]+)\/reschedule$/);
    if (reschedule && request.method === "POST")
      return await rescheduleBooking(request, response, reschedule[1]);
    const ownBooking = path.match(/^\/bookings\/([0-9a-f-]+)(?:\/(cancel|refund))?$/);
    if (ownBooking && !ownBooking[2] && request.method === "GET") {
      const user = sessionUser(request);
      if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
      // Somebody else's booking and no booking are the same 404.
      const row = bookingsOf(request, user).find(
        (candidate) => candidate.id === ownBooking[1],
      );
      if (!row) return error(response, 404, "NOT_FOUND", "No such booking.");
      return send(response, 200, zGetBookingResponse.parse(row));
    }
    if (ownBooking?.[2] && request.method === "POST")
      return await changeBooking(request, response, ownBooking[1], ownBooking[2]);

    const owned = path.match(/^\/(captures|missions)\/([0-9a-f-]+)(\/download)?$/);
    if (owned && request.method === "GET") {
      const user = sessionUser(request);
      if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
      const [, collection, id, download] = owned;
      if (collection === "missions" && !download) {
        const mission = missions.find((row) => row.id === id && row.userId === user.id);
        if (!mission) return error(response, 404, "NOT_FOUND", "No such mission.");
        return send(response, 200, zGetMissionResponse.parse(mission));
      }
      // Somebody else's capture and no capture are the same 404.
      const row = captures.find(
        (c) => c.capture.id === id && c.capture.userId === user.id,
      );
      if (collection !== "captures" || !row)
        return error(response, 404, "NOT_FOUND", "No such capture.");
      if (!download)
        return send(response, 200, zGetCaptureResponse.parse(withThumbnail(row)));
      const kind = new URL(request.url, "http://fake").searchParams.get("kind");
      if (!["IMAGE", "THUMBNAIL", "FITS", "UNMARKED"].includes(kind))
        return error(
          response,
          422,
          "VALIDATION_FAILED",
          "A capture asset kind is required.",
        );
      if (!row.assets.includes(kind))
        return error(response, 404, "NOT_FOUND", "No such capture.");
      return send(
        response,
        200,
        zGetCaptureDownloadResponse.parse({
          kind,
          url: signed(id, kind),
          expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        }),
      );
    }
    const stored = path.match(/^\/storage\/([0-9a-f-]+)\/(thumbnail|image|fits)$/);
    if (stored && request.method === "GET") {
      if (stored[2] === "fits") {
        response.writeHead(200, {
          "content-type": "application/fits",
          "content-disposition": `attachment; filename="${stored[1]}.fits"`,
        });
        return response.end(
          "SIMPLE  =                    T / simulated, not a real frame",
        );
      }
      response.writeHead(200, { "content-type": "image/svg+xml" });
      return response.end(simulatedFrame());
    }
    const target = path.match(/^\/admin\/targets\/([0-9a-f-]+)$/);
    if (target && request.method === "PATCH") {
      return await patchTarget(request, response, target[1]);
    }
    error(response, 404, "NOT_FOUND", "Not implemented by the fake.");
  })
  .on("upgrade", upgrade)
  .listen(port, "127.0.0.1");
