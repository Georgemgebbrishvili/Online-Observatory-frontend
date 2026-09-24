"use client";

import type { AuditCategory, AuditEvent } from "@darkview/contracts";
import { AuditCategory as auditCategories } from "@darkview/contracts";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { StatePanel } from "@/components/ui/state-panel";
import { listAuditEvents } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import { usePagedList } from "@/features/operator/use-paged-list";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";

const ALL = "";

export function AuditLog({
  copy,
  initialMission,
  locale,
}: {
  copy: OperatorCopy;
  // The missions table links here with ?mission=<id>, so an operator moves from a
  // mission straight to its correlated events. The route reads it and passes it in,
  // which keeps this component out of a Suspense boundary.
  initialMission: string | null;
  locale: Locale;
}) {
  const text = copy.logs;
  const { table } = copy;
  const [mission, setMission] = useState<string | null>(initialMission);
  const [category, setCategory] = useState<string>(ALL);

  const load = useCallback(
    (cursor?: string) =>
      listAuditEvents({
        missionId: mission ?? undefined,
        category: category === ALL ? undefined : (category as AuditCategory),
        cursor,
      }),
    [category, mission],
  );
  const events = usePagedList<AuditEvent>(load);

  return (
    <section className="surface-panel operator-list" aria-labelledby="operator-logs">
      <header>
        <h2 id="operator-logs">{text.title}</h2>
        <p>{text.detail}</p>
      </header>

      <div className="operator-filters">
        <Dropdown
          label={text.filter}
          onChange={(event) => setCategory(event.currentTarget.value)}
          options={[
            { label: table.all, value: ALL },
            ...Object.values(auditCategories).map((value) => ({
              label: copy.auditCategories[value],
              value,
            })),
          ]}
          value={category}
        />
        {mission && (
          <p className="operator-filter-note">
            <span className="data">{mission.slice(0, 8)}</span>
            <Button onClick={() => setMission(null)} size="small" variant="ghost">
              {text.clearMission}
            </Button>
          </p>
        )}
      </div>

      {events.error && (
        <p className="operator-tone-error" role="alert">
          {fill(table.failed, { message: events.error })}
        </p>
      )}

      {events.items.length === 0 && !events.loading && !events.error ? (
        <StatePanel description={text.emptyDetail} title={text.empty} />
      ) : (
        <ol className="operator-events">
          {events.items.map((event) => (
            <li key={event.id}>
              <div className="operator-event-head">
                <time className="data" dateTime={event.at}>
                  {new Date(event.at).toLocaleString(
                    locale === "ka" ? "ka-GE" : "en-GB",
                    { dateStyle: "short", timeStyle: "medium" },
                  )}
                </time>
                <span className="operator-event-category">
                  {copy.auditCategories[event.category]}
                </span>
                <strong className="data">{event.action}</strong>
              </div>
              <dl className="operator-event-meta">
                <div>
                  <dt>{text.actor}</dt>
                  <dd className="data">
                    {event.actorUserId ? event.actorUserId.slice(0, 8) : text.system}
                  </dd>
                </div>
                {event.missionId && (
                  <div>
                    <dt>{text.mission}</dt>
                    <dd className="data">{event.missionId.slice(0, 8)}</dd>
                  </div>
                )}
              </dl>
              {event.detail && Object.keys(event.detail).length > 0 && (
                <pre className="operator-event-detail">
                  {JSON.stringify(event.detail, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}

      {events.loading && <p role="status">{table.loading}</p>}
      {events.hasMore && !events.loading && (
        <Button onClick={events.loadMore} variant="secondary">
          {table.loadMore}
        </Button>
      )}
    </section>
  );
}
