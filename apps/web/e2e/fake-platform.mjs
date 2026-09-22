// A stand-in for darkview-platform's API, for end-to-end tests only. It behaves as
// ADR-016 specifies — exact Origin check on every mutation, two cookies, a session
// valid only when both arrive — and every body it sends is parsed by the generated
// contract validators, so it cannot drift into a shape the contract does not have.
import { randomUUID } from "node:crypto";
import http from "node:http";

import { zApiError, zUser } from "@darkview/contracts/zod";

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
