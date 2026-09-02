"use client";

import { useId } from "react";
import type { SelectHTMLAttributes } from "react";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly DropdownOption[];
};

export function Dropdown({
  className = "",
  id,
  label,
  options,
  ...props
}: DropdownProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <span className="select-shell">
        <select className={`select ${className}`} id={inputId} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true">⌄</span>
      </span>
    </label>
  );
}
