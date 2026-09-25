// A stand-in for darkview-platform's API, for end-to-end tests only. It behaves as
// ADR-016 specifies — exact Origin check on every mutation, two cookies, a session
// valid only when both arrive — and every body it sends is parsed by the generated
// contract validators, so it cannot drift into a shape the contract does not have.
import { randomUUID } from "node:crypto";
import http from "node:http";

import {
  zAdminCancelMissionRequest,
  zAdminListAuditEventsResponse,
  zAdminListMissionsResponse,
  zAdminUpdateTargetRequest,
  zAdminUpdateTargetResponse,
  zApiError,
  zGetObservatoryConditionsResponse,
  zGetObservatoryStatusResponse,
  zListBookableObservatoriesResponse,
  zGetTargetResponse,
  zListTargetsResponse,
  zListTonightTargetsResponse,
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
    scheduledStartAt: "2026-09-24T20:00:00.000Z",
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
    captureIds: ["60000000-0000-4000-8000-000000000001"],
    observable: false,
    observerCapacity: 5,
  },
];

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
    const target = path.match(/^\/admin\/targets\/([0-9a-f-]+)$/);
    if (target && request.method === "PATCH") {
      return await patchTarget(request, response, target[1]);
    }
    error(response, 404, "NOT_FOUND", "Not implemented by the fake.");
  })
  .listen(port, "127.0.0.1");
