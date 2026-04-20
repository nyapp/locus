"use client";

type Props = {
  current: number;
  total: number;
  className?: string;
};

export function ProgressBar({ current, total, className = "" }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="tabular-nums">
          {current} / {total}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="回答の進捗"
      >
        <div
          className="h-full rounded-full bg-zinc-900 transition-[width] duration-300 ease-out dark:bg-zinc-100"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
