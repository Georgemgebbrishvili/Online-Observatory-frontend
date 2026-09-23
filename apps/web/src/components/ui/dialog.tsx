"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "./button";

type DialogProps = {
  /** Omitted in controlled mode, where the caller renders its own trigger. */
  triggerLabel?: string;
  title: string;
  description?: string;
  children: ReactNode;
  closeLabel: string;
  variant?: "modal" | "sheet";
  /**
   * Controlled mode. Use it when the trigger sits somewhere a dialog must not be
   * rendered -- a table cell or a flex row lays the dialog's box out with its
   * siblings, which displaces the panel's contents.
   */
  open?: boolean;
  onClose?: () => void;
};

export function Dialog({
  children,
  closeLabel,
  description,
  onClose,
  open,
  title,
  triggerLabel,
  variant = "modal",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const controlled = open !== undefined;

  useEffect(() => {
    if (!controlled) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [controlled, open]);

  return (
    <>
      {!controlled && triggerLabel && (
        <Button variant="secondary" onClick={() => dialogRef.current?.showModal()}>
          {triggerLabel}
        </Button>
      )}
      <dialog
        ref={dialogRef}
        className={`dialog dialog-${variant}`}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClose={onClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="dialog-panel">
          <header className="dialog-header">
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p id={descriptionId}>{description}</p>}
            </div>
            <form method="dialog">
              <button className="dialog-close" aria-label={closeLabel} title={closeLabel}>
                <span aria-hidden="true">×</span>
              </button>
            </form>
          </header>
          <div className="dialog-content">{children}</div>
          <footer className="dialog-footer">
            <form method="dialog">
              <Button type="submit" variant="secondary">
                {closeLabel}
              </Button>
            </form>
          </footer>
        </div>
      </dialog>
    </>
  );
}

export function Modal(props: Omit<DialogProps, "variant">) {
  return <Dialog {...props} variant="modal" />;
}

export function Sheet(props: Omit<DialogProps, "variant">) {
  return <Dialog {...props} variant="sheet" />;
}
