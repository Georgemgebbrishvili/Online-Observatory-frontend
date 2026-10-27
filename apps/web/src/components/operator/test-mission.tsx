"use client";

import type { Target, TestMission } from "@darkview/contracts";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { scheduleTestMission } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

import { useOperatorConsole } from "./console-provider";

const LENGTHS = [15, 30, 60, 120, 240];

/**
 * Platform ADR-075: the hardware test observatory cannot be booked, so the operator
 * schedules a mission on it from now and starts it in the ordinary mission room.
 */
export function TestMissionPanel({
  copy,
  locale,
  targets,
}: {
  copy: OperatorCopy["testMission"];
  locale: Locale;
  targets: readonly Target[];
}) {
  const { observatoryId } = useOperatorConsole();
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");
  const [minutes, setMinutes] = useState(30);
  const [pending, setPending] = useState(false);
  const [scheduled, setScheduled] = useState<TestMission | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      setScheduled(
        await scheduleTestMission(observatoryId, { targetId, durationMinutes: minutes }),
      );
    } catch (failure) {
      const message =
        failure instanceof ApiRequestError
          ? (failure.error?.message ?? String(failure.status))
          : "";
      setError(fill(copy.failed, { message }));
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="surface-panel operator-test-mission"
      aria-labelledby="operator-test-mission-title"
    >
      <h2 id="operator-test-mission-title">{copy.title}</h2>
      <p>{copy.detail}</p>
      <form className="operator-form" onSubmit={submit}>
        <Dropdown
          label={copy.target}
          value={targetId}
          onChange={(event) => setTargetId(event.currentTarget.value)}
          options={targets.map((target) => ({
            value: target.id,
            label: locale === "ka" ? target.nameKa : target.nameEn,
          }))}
        />
        <Dropdown
          label={copy.length}
          value={String(minutes)}
          onChange={(event) => setMinutes(Number(event.currentTarget.value))}
          options={LENGTHS.map((length) => ({
            value: String(length),
            label: fill(copy.minutes, { minutes: String(length) }),
          }))}
        />
        <Button disabled={!targetId || pending} loading={pending} type="submit">
          {copy.submit}
        </Button>
        {error && (
          <p className="operator-tone-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {scheduled && (
        <p role="status">
          {fill(copy.scheduled, {
            time: new Date(scheduled.slotStartAt).toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Tbilisi",
            }),
            minutes: String(scheduled.durationMinutes),
          })}{" "}
          <a href={`/${locale}/app/missions/${scheduled.missionId}/session`}>
            {copy.open}
          </a>
        </p>
      )}
    </section>
  );
}
