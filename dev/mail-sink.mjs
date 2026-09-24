#!/usr/bin/env node
// Development stand-in for the email-verification webhook. The platform POSTs
// {recipient, verificationUrl, locale} here, signed with EMAIL_VERIFICATION_WEBHOOK_SECRET
// in x-darkview-signature (base64url HMAC-SHA256 of the body). This prints the link
// instead of emailing it. Started by scripts/dev-stack.mjs; binds 127.0.0.1 only.
import { createHmac, timingSafeEqual } from "node:crypto";
import http from "node:http";

const port = Number(process.env.MAIL_SINK_PORT ?? 4010);
const secret = process.env.EMAIL_VERIFICATION_WEBHOOK_SECRET ?? "";
if (secret.length < 32) {
  console.error(
    "EMAIL_VERIFICATION_WEBHOOK_SECRET is missing or shorter than 32 characters.",
  );
  process.exit(1);
}

function signatureMatches(body, presented) {
  const expected = Buffer.from(
    createHmac("sha256", secret).update(body).digest("base64url"),
  );
  const actual = Buffer.from(presented ?? "");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

http
  .createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      if (
        request.method !== "POST" ||
        !signatureMatches(body, request.headers["x-darkview-signature"])
      ) {
        console.log(`refused ${request.method} ${request.url}: not a signed webhook`);
        response.writeHead(401).end();
        return;
      }
      const { recipient, verificationUrl } = JSON.parse(body);
      console.log(`verification for ${recipient}:\n    ${verificationUrl}`);
      response.writeHead(204).end();
    });
  })
  .listen(port, "127.0.0.1", () => console.log(`listening on 127.0.0.1:${port}`));
