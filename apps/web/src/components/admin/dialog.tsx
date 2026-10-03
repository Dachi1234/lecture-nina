"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@nina/ui";

export function Dialog({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-label={title}
      className={`m-auto max-h-[90vh] w-[min(calc(100%-24px),var(--w))] rounded-3xl border-[1.5px] border-line bg-paper p-0 text-ink backdrop:bg-navy/40`}
      style={{ ["--w" as string]: wide ? "880px" : "560px" }}
    >
      {open ? (
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="დახურვა" className="flex size-11 items-center justify-center rounded-xl text-ink-muted hover:bg-line-soft">
              <Icon name="close" width={20} height={20} />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
