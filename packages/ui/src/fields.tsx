"use client";

import type { ButtonHTMLAttributes, ChangeEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const fieldClass =
  "w-full rounded-xl border-[1.5px] border-sand bg-card px-4 text-base text-ink outline-none transition placeholder:text-ink-muted focus:border-teal-deep focus:bg-white focus:ring-4 focus:ring-teal-soft aria-[invalid=true]:border-2 aria-[invalid=true]:border-burgundy";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  id: string;
};

export function Field({ label, hint, error, children, id }: FieldProps) {
  const messageId = error ? `${id}-error` : undefined;
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink" htmlFor={id}>
      <span>
        {label}
        {hint ? <span className="ml-1 font-normal text-ink-muted">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span id={messageId} className="text-[13px] font-medium text-burgundy">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      className={cn(fieldClass, "h-[52px]", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      className={cn(fieldClass, "min-h-24 resize-none py-3", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      {...props}
    />
  );
}

type ChoiceChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed: boolean;
};

export function ChoiceChip({ pressed, className, children, ...props }: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-11 items-center rounded-xl border-[1.5px] border-sand bg-card px-4 text-[15px] font-medium text-ink",
        pressed && "border-teal-deep bg-teal-deep text-on-dark",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type CheckboxProps = {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
};

export function Checkbox({ id, checked = false, onCheckedChange, children, invalid }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("flex items-start gap-3 text-[15px] leading-normal", invalid && "text-burgundy")}>
      <input
        id={id}
        type="checkbox"
        aria-invalid={invalid || undefined}
        className="mt-0.5 size-6 shrink-0 appearance-none rounded-md border-2 border-sand bg-card checked:border-teal-deep checked:bg-teal-deep"
        {...(onCheckedChange
          ? { checked, onChange: (event: ChangeEvent<HTMLInputElement>) => onCheckedChange(event.target.checked) }
          : { defaultChecked: checked })}
      />
      <span>{children}</span>
    </label>
  );
}
