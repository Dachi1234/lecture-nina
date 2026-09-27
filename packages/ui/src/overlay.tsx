"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./icons";

export function Accordion({
  items,
}: {
  items: Array<{ id: string; question: string; answer: string }>;
}) {
  return (
    <AccordionPrimitive.Root type="single" collapsible defaultValue={items[0]?.id} className="flex flex-col">
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.id} value={item.id} className="border-b border-line">
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-lg font-semibold">
              {item.question}
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line transition group-data-[state=open]:bg-teal-deep group-data-[state=open]:text-on-dark">
                <Icon name="close" className="size-4 rotate-45 transition group-data-[state=open]:rotate-0" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="pb-4 text-base leading-relaxed text-ink-muted">
            {item.answer}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

function DialogFrame({
  trigger,
  title,
  children,
  className,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--scrim)]" />
        <Dialog.Content
          className={cn(
            "fixed z-50 bg-card shadow-[var(--shadow-modal)] focus:outline-none",
            className,
          )}
        >
          <Dialog.Title className="font-hand text-4xl text-burgundy">{title}</Dialog.Title>
          {children}
          <Dialog.Close className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-xl bg-sand-soft" aria-label="დახურვა">
            <Icon name="close" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Modal({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  return (
    <DialogFrame
      trigger={trigger}
      title={title}
      className="top-1/2 left-1/2 w-[min(1000px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-8"
    >
      {children}
    </DialogFrame>
  );
}

export function BottomSheet({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  return (
    <DialogFrame trigger={trigger} title={title} className="inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl p-6">
      {children}
    </DialogFrame>
  );
}

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-xl border-[1.5px] border-line bg-card px-4 py-3 text-sm font-medium shadow-[var(--shadow-lift)]">
      {children}
    </div>
  );
}
