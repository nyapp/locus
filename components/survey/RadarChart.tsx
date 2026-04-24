"use client";

import { useId } from "react";

type Props = {
  title: string;
  /** 時計回りに配置（先頭が上） */
  labels: string[];
  /** 0〜100。null の軸は 0 として描画（輪郭の欠損を避ける） */
  values: (number | null)[];
  /** チャート正方形の一辺（px） */
  size?: number;
};

export function RadarChart({ title, labels, values, size = 220 }: Props) {
  const titleId = useId();
  const n = labels.length;
  const longestLabelLength = labels.reduce(
    (max, label) => Math.max(max, label.length),
    0,
  );
  // 軸ラベルの文字幅に応じて viewBox 余白を確保し、テキストの見切れを防ぐ。
  const viewBoxPadding = Math.max(24, 20 + longestLabelLength * 6);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.78;
  const levels = [25, 50, 75, 100];

  const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

  const pts = labels.map((_, i) => {
    const v = values[i];
    const t = (v === null ? 0 : Math.min(100, Math.max(0, v))) / 100;
    const r = maxR * t;
    const a = angleAt(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const d = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
      aria-labelledby={titleId}
    >
      <h3
        id={titleId}
        className="mb-3 text-center text-sm font-medium text-zinc-800 dark:text-zinc-100"
      >
        {title}
      </h3>
      <div className="flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`}
          role="img"
          aria-label={title}
        >
          <title>{title}</title>
          <desc>
            {labels.map((lab, i) => `${lab}: ${values[i] ?? "データなし"}`).join("、")}
          </desc>
          {levels.map((lv) => (
            <polygon
              key={lv}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-zinc-200 dark:text-zinc-600"
              points={labels
                .map((_, i) => {
                  const r = (maxR * lv) / 100;
                  const a = angleAt(i);
                  return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
                })
                .join(" ")}
            />
          ))}
          {labels.map((lab, i) => {
            const a = angleAt(i);
            const lx = cx + (maxR + 12) * Math.cos(a);
            const ly = cy + (maxR + 12) * Math.sin(a);
            const anchor =
              Math.abs(Math.cos(a)) < 0.01
                ? "middle"
                : Math.cos(a) > 0
                  ? "start"
                  : "end";
            return (
              <text
                key={lab}
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
                style={{ fontSize: 11 }}
              >
                {lab}
              </text>
            );
          })}
          <polygon
            fill="rgba(24,24,27,0.12)"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-zinc-800 dark:text-zinc-100"
            points={d}
          />
        </svg>
      </div>
    </section>
  );
}
