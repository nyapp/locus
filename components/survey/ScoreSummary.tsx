"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ARCHETYPE_ANALYSIS_JA,
  ARCHETYPE_LABEL_JA,
  BAND_LABEL_JA,
  COMPOSITE_KEYS,
  COMPOSITE_LABEL_JA,
  getCompositeLowFraming,
  type CompositeKey,
} from "@/lib/scoring";
import type { BandId, ScoreReport } from "@/lib/scoring/types";
import { RadarChart } from "./RadarChart";

type Props = {
  report: ScoreReport;
  onRetry?: () => void;
};

const BF_RADAR_LABELS = [
  "開放性",
  "誠実性",
  "外向性",
  "協調性",
  "感情反応性",
] as const;

const STYLE_RADAR_LABELS = [
  "自律性",
  "有能感",
  "関係性",
  "経験",
  "内省",
  "抽象化",
  "実験",
] as const;

const ARCHETYPE_IMAGE_PATH: Record<CompositeKey, string> = {
  exploration: "/images/archetype-exploration.png",
  persistence: "/images/archetype-persistence.png",
  intrinsicMotivation: "/images/archetype-intrinsic-motivation.png",
  reflectionDepth: "/images/archetype-reflection-depth.png",
  execution: "/images/archetype-execution.png",
  collaboration: "/images/archetype-collaboration.png",
};

export function ScoreSummary({ report, onRetry }: Props) {
  const [isArchetypeCardVisible, setIsArchetypeCardVisible] = useState(true);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const { dimensions, emotionalReactivity, composites, bandByComposite } =
    report;
  const archetypeImagePath = report.archetypeKey
    ? ARCHETYPE_IMAGE_PATH[report.archetypeKey]
    : null;
  const complementArchetypeKey = COMPOSITE_KEYS.reduce<CompositeKey | null>(
    (lowestKey, key) => {
      const score = composites[key];
      if (score === null) return lowestKey;
      if (lowestKey === null) return key;
      const lowestScore = composites[lowestKey];
      if (lowestScore === null || score < lowestScore) return key;
      return lowestKey;
    },
    null,
  );

  const bfValues = [
    dimensions.Openness,
    dimensions.Conscientiousness,
    dimensions.Extraversion,
    dimensions.Agreeableness,
    emotionalReactivity,
  ];

  const styleValues = [
    dimensions.Autonomy,
    dimensions.Competence,
    dimensions.Relatedness,
    dimensions.Experience,
    dimensions.Reflection,
    dimensions.Abstract,
    dimensions.Experiment,
  ];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-8 px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header>
        <h1 className="mb-1 text-base font-medium text-zinc-500 dark:text-zinc-400">
          Locus - 学習傾向診断
        </h1>
      </header>

      {report.archetypeLabelJa && (
        <section aria-labelledby="archetype-heading">
          <h2
            id="archetype-heading"
            className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            学習アーキタイプ
          </h2>
          <div>
            <button
              type="button"
              onClick={() => setIsArchetypeCardVisible((prev) => !prev)}
              aria-expanded={isArchetypeCardVisible}
              aria-controls="archetype-symbol-card"
              className="w-full rounded-2xl bg-zinc-100 px-6 py-5 text-left text-zinc-900 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-200 dark:text-zinc-900 dark:focus-visible:ring-zinc-500"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xl font-semibold leading-snug">
                  {report.archetypeLabelJa}
                </span>
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-400 text-zinc-600 dark:border-zinc-500 dark:text-zinc-700"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12H18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {!isArchetypeCardVisible && (
                      <path
                        d="M12 6V18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </span>
              </div>
            </button>

            {isArchetypeCardVisible && (
              <div
                id="archetype-symbol-card"
                className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                {archetypeImagePath && (
                  <Image
                    src={`${basePath}${archetypeImagePath}`}
                    alt={`${report.archetypeLabelJa}のカードイラスト`}
                    width={674}
                    height={1024}
                    className="h-auto w-full"
                    priority
                  />
                )}
              </div>
            )}

            {report.archetypeKey && (
              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {ARCHETYPE_ANALYSIS_JA[report.archetypeKey]}
                </p>
              </div>
            )}

            <div className="mt-3 space-y-1">
              {report.archetypeConfidence !== null && report.typeLine ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  判定確信度: {report.archetypeConfidence.toFixed(1)} / 上位3指標:{" "}
                  {report.typeLine}
                </p>
              ) : report.archetypeConfidence !== null ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  判定確信度: {report.archetypeConfidence.toFixed(1)}
                </p>
              ) : report.typeLine ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  上位3指標: {report.typeLine}
                </p>
              ) : null}
              {report.archetypeReasons && (
                <>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    根拠: {report.archetypeReasons.join(" / ")}
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    補完するアーキタイプ:{" "}
                    {complementArchetypeKey
                      ? ARCHETYPE_LABEL_JA[complementArchetypeKey]
                      : "算出不可"}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="composite-heading">
        <h2
          id="composite-heading"
          className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-100"
        >
          学習傾向の分析
        </h2>
        <ul className="flex flex-col gap-4">
          {COMPOSITE_KEYS.map((key) => (
            <CompositeBar
              key={key}
              ckey={key}
              value={composites[key]}
              band={bandByComposite[key]}
            />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="theory-heading">
        <h2
          id="theory-heading"
          className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
        >
          理論軸
        </h2>
        <RadarChart
          title="性格（Big Five + 感情反応性）"
          labels={[...BF_RADAR_LABELS]}
          values={[...bfValues]}
        />
        <RadarChart
          title="動機動機・学習スタイル（SDT + Kolb）"
          labels={[...STYLE_RADAR_LABELS]}
          values={[...styleValues]}
        />
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Kolb の Balance（固定化・学習適応）はこのレーダーには含めていません。
        </p>
      </section>

      <section aria-labelledby="notes-heading">
        <h2
          id="notes-heading"
          className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          補足
        </h2>
        <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          <li>
            数値帯の「低め」は、短所の断定ではなく、学び方の傾向をみる際の参考として扱っています。
          </li>
          <li>
            感情反応性は、Big Five
            の神経症傾向に関連する補助的な指標として、安定側の値をもとに算出しています。
          </li>
        </ul>
      </section>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[48px] rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        >
          もう一度回答する
        </button>
      )}
    </div>
  );
}

function CompositeBar({
  ckey,
  value,
  band,
}: {
  ckey: CompositeKey;
  value: number | null;
  band: BandId | null;
}) {
  const label = COMPOSITE_LABEL_JA[ckey];
  const framing =
    band && value !== null ? getCompositeLowFraming(ckey, band) : null;

  if (value === null || band === null) {
    return (
      <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {label}
          </span>
          <span className="text-xs text-zinc-500">算出不可</span>
        </div>
      </li>
    );
  }

  const pct = Math.round(Math.min(100, Math.max(0, value)));
  const bandJa = BAND_LABEL_JA[band];

  return (
    <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {label}
        </span>
        <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
          {pct}（{bandJa}）
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      {framing && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {framing}
        </p>
      )}
    </li>
  );
}
