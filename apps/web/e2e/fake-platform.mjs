// A stand-in for darkview-platform's API, for end-to-end tests only. It behaves as
// ADR-016 specifies — exact Origin check on every mutation, two cookies, a session
// valid only when both arrive — and every body it sends is parsed by the generated
// contract validators, so it cannot drift into a shape the contract does not have.
import { randomUUID } from "node:crypto";
import http from "node:http";

import {
  zApiError,
  zListBookableObservatoriesResponse,
  zListTargetsResponse,
  zMissionCommandAccepted,
  zOperatorObservatoryState,
  zOperatorOverrideRequest,
  zSetObservatoryModeRequest,
  zUser,
} from "@darkview/contracts/zod";

const port = Number(process.env.FAKE_PLATFORM_PORT ?? 4100);
const appOrigin = process.env.FAKE_PLATFORM_APP_URL ?? "http://localhost:3000";
const sessionCookie = "darkview_session";
const csrfCookie = "darkview_csrf";

// The observer owns the simulated live mission in src/features/live/live-data.ts.
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
      locale: "en",
      createdAt: "2026-09-01T00:00:00.000Z",
    }),
  ]),
);
const sessions = new Map();

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
      nameEn: "Darkview Tbilisi",
      nameKa: "Darkview თბილისი",
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
      slug: "m13",
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
  ],
  page: { hasMore: false, nextCursor: null },
});
const observatory = { mode: "SIMULATED", parked: false, activeMissionId: missionId };

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

function error(response, status, code, message) {
  send(response, status, zApiError.parse({ code, message }));
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
  "GET /targets": (_request, response) => send(response, 200, targets),
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
  "GET /me": (request, response) => {
    const user = sessionUser(request);
    if (!user) return error(response, 401, "UNAUTHENTICATED", "No session.");
    send(response, 200, zUser.parse(user));
  },
  "POST /auth/sign-in": async (request, response) => {
    const body = await json(request);
    const user = users.get(body?.email);
    if (!user || body?.password !== fakePassword) {
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

http
  .createServer(async (request, response) => {
    const path = new URL(request.url, "http://fake").pathname;
    if (path === "/health") return send(response, 200, { ok: true });
    // ADR-016 §3: every mutation carries this app's Origin, and a missing one is refused.
    if (request.method !== "GET" && request.headers.origin !== appOrigin) {
      return error(response, 403, "FORBIDDEN", "Cross-origin mutation refused.");
    }
    const route = routes[`${request.method} ${path}`];
    if (!route) return error(response, 404, "NOT_FOUND", "Not implemented by the fake.");
    await route(request, response);
  })
  .listen(port, "127.0.0.1");
