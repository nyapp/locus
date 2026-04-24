"use client";

import {
  ARCHETYPE_ANALYSIS_JA,
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

export function ScoreSummary({ report, onRetry }: Props) {
  const { dimensions, emotionalReactivity, composites, bandByComposite } =
    report;

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
          Strategic Learning Matrix
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
            <p className="rounded-2xl bg-zinc-100 px-6 py-5 text-xl font-semibold leading-snug text-zinc-900 dark:bg-zinc-200 dark:text-zinc-900">
              {report.archetypeLabelJa}
            </p>

            {report.archetypeKey && (
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                鑑定の根拠（分析内容）: {ARCHETYPE_ANALYSIS_JA[report.archetypeKey]}
              </p>
            )}

            <div className="mt-3 space-y-1">
              {report.archetypeConfidence !== null && report.typeLine ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  信頼度: {report.archetypeConfidence.toFixed(1)} / 上位3指標:{" "}
                  {report.typeLine}
                </p>
              ) : report.archetypeConfidence !== null ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  信頼度: {report.archetypeConfidence.toFixed(1)}
                </p>
              ) : report.typeLine ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  上位3指標: {report.typeLine}
                </p>
              ) : null}
              {report.archetypeReasons && (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  根拠: {report.archetypeReasons.join(" / ")}
                </p>
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
          className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100"
        >
          補足
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <li>数値帯の「低め」は短所ではなく、学び方のクセの目安です。</li>
          <li>
            感情反応性は Big Five
            の神経症傾向に対応する素材指標として、安定側から算出した値です。
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
