# Uptime history for /status

- **Screen:** `/[locale]/status`, "The last 30 days" (Phase 6.0).
- **Need:** thirty days of the observatory link: a share per day, the overall share, and
  the latest interruptions.
- **Answered by:** platform #202, merged as 9f61cbb on 2026-10-23:
  `GET /observatories/{observatoryId}/uptime` (`ObservatoryUptime`), read from the
  existing `AGENT_LINK_UP` / `AGENT_LINK_LOST` audit rows. Unmeasured time is null,
  never 100. Synced here in 7650a1d.
