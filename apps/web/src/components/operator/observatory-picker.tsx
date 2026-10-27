"use client";

import { useRouter } from "next/navigation";

import { operatorObservatoryCookie } from "@/features/operator/observatory-cookie";

type PickerProps = {
  label: string;
  hardwareTest: string;
  selected: string;
  options: { id: string; name: string; hardwareTest: boolean }[];
};

/**
 * Which observatory the operator console works on (platform ADR-074): the demo, or
 * the hardware test observatory no customer can book. Remembered in a cookie; the
 * layout checks it against the platform's list on every request.
 */
export function ObservatoryPicker({
  hardwareTest,
  label,
  options,
  selected,
}: PickerProps) {
  const router = useRouter();
  return (
    <label className="operator-picker">
      <span>{label}</span>
      <select
        value={selected}
        onChange={(event) => {
          document.cookie = `${operatorObservatoryCookie}=${event.target.value}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.hardwareTest ? `${option.name} · ${hardwareTest}` : option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
