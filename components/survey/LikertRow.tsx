"use client";

import type { LikertValue, ScaleOption } from "@/lib/types";

type Props = {
  options: ScaleOption[];
  value: LikertValue | undefined;
  onChange: (v: LikertValue) => void;
  name: string;
  labelledBy?: string;
  disabled?: boolean;
};

export function LikertRow({
  options,
  value,
  onChange,
  name,
  labelledBy,
  disabled,
}: Props) {
  return (
    <fieldset
      className="min-w-0 w-full border-0 p-0"
      disabled={disabled}
      aria-labelledby={labelledBy}
    >
      <legend className="sr-only">5件法の回答</legend>
      <div className="flex w-full min-w-0 flex-col gap-2">
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={`flex w-full min-w-0 min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-400 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-white dark:has-[:focus-visible]:ring-offset-zinc-950 ${
                checked
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                id={id}
                type="radio"
                className="sr-only"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
              />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                  checked
                    ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                }`}
                aria-hidden
              >
                {opt.value}
              </span>
              <span className="min-w-0 flex-1 text-left text-base leading-snug">
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
