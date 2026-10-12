"use client";

import { useEffect, useId, useRef, useState } from "react";

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open) {
      setSubmitted(false);
      if (dialog.open) dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={event => {
        event.preventDefault();
        if (!busy && !submitted) onCancel();
      }}
      className="w-[min(92vw,28rem)] rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={busy || submitted}
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || submitted}
            onClick={() => {
              if (busy || submitted) return;
              setSubmitted(true);
              onConfirm();
            }}
            className="rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy || submitted ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
