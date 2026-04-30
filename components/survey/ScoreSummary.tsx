"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ARCHETYPE_ANALYSIS_JA,
  ARCHETYPE_LABEL_JA,
  COMPOSITE_EDGE_LABELS_JA,
  COMPOSITE_KEYS,
  COMPOSITE_LABEL_JA,
  compositeLrBarStyle,
  formatCompositeLrDisplay,
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

const RADAR_TREND_EXAMPLES: Record<string, string> = {
  開放性: "新しいテーマを試し、複数案を比較しながら学ぶ",
  誠実性: "計画を立て、タスクを分解して着実に進める",
  外向性: "対話や発表を取り入れ、外部刺激で理解を深める",
  協調性: "他者視点を取り入れ、共同作業で学習を進める",
  感情反応性: "負荷を調整し、安心できる環境で集中して学ぶ",
  自律性: "目的と手段を自分で選び、主体的に進める",
  有能感: "小さな達成を積み上げ、進捗を見える化して継続する",
  関係性: "伴走者やコミュニティとつながりながら学ぶ",
  経験: "まず手を動かし、体験から理解を組み立てる",
  内省: "振り返りと言語化を通じて学びを定着させる",
  抽象化: "共通パターンを整理し、原理から理解する",
  実験: "小さく試して検証し、改善を素早く回す",
};

const ARCHETYPE_IMAGE_PATH: Record<CompositeKey, string> = {
  exploration: "/images/archetype-exploration.png",
  persistence: "/images/archetype-persistence.png",
  intrinsicMotivation: "/images/archetype-intrinsic-motivation.png",
  reflectionDepth: "/images/archetype-reflection-depth.png",
  execution: "/images/archetype-execution.png",
  collaboration: "/images/archetype-collaboration.png",
};

export function ScoreSummary({ report, onRetry }: Props) {
  const [isArchetypeCardVisible, setIsArchetypeCardVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
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
  const archetypeAnalysis =
    report.archetypeKey === null
      ? null
      : ARCHETYPE_ANALYSIS_JA[report.archetypeKey]
          .split("\n\n")
          .map((paragraph) => paragraph.replace(/\n/g, ""))
          .join("\n");

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
  const getRadarTrend = (labels: readonly string[], values: (number | null)[]) => {
    let maxIdx = -1;
    let maxValue = -Infinity;
    values.forEach((value, idx) => {
      if (value === null) return;
      if (value > maxValue) {
        maxValue = value;
        maxIdx = idx;
      }
    });

    if (maxIdx < 0) {
      return {
        dominant: "未判定",
        learning: "未判定",
      };
    }

    const dominant = labels[maxIdx] ?? "未判定";
    const example = RADAR_TREND_EXAMPLES[dominant] ?? "自分に合う手順を明確にして学ぶ";
    return {
      dominant,
      learning: example,
    };
  };
  const bfTrend = getRadarTrend(BF_RADAR_LABELS, bfValues);
  const styleTrend = getRadarTrend(STYLE_RADAR_LABELS, styleValues);
  const printedAt = new Date().toLocaleString("ja-JP");
  const handlePrint = () => {
    if (typeof window === "undefined") return;
    setIsPrinting(true);
    window.print();
    window.setTimeout(() => setIsPrinting(false), 300);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-8 px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header>
        <h1 className="mb-1 text-base font-medium text-zinc-500 dark:text-zinc-400">
          Locus - 学習傾向診断
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          出力日時: {printedAt}
        </p>
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
                <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {archetypeAnalysis}
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
          className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100"
        >
          学習傾向のバランス
        </h2>
        <ul className="flex flex-col gap-2.5">
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
          理論軸レーダーチャート
        </h2>
        <RadarChart
          title="性格（Big Five + 感情反応性）"
          labels={[...BF_RADAR_LABELS]}
          values={[...bfValues]}
          insightText={`診断の結果、あなたの性格は「${bfTrend.dominant}」の傾向がもっとも強く、学習において「${bfTrend.learning}」傾向があります。`}
        />
        <RadarChart
          title="動機づけ・学習スタイル（SDT + Kolb）"
          labels={[...STYLE_RADAR_LABELS]}
          values={[...styleValues]}
          insightText={`診断の結果、あなたの学習スタイルは「${styleTrend.dominant}」の傾向がもっとも強く、学習において「${styleTrend.learning}」傾向があります。`}
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
            学習傾向の分析では、中央を 0（raw
            スコア50）とし、低め側の離れ度を L0〜50・高め側を
            R0〜50として表示しています。
          </li>
          <li>
            各指標の下に出る短文は、短所の断定ではなく、学び方の傾向をみる際の参考として扱っています。
          </li>
          <li>
            感情反応性は、Big Five
            の神経症傾向に関連する補助的な指標として、安定側の値をもとに算出しています。
          </li>
        </ul>
      </section>

      <div className="flex flex-col gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          disabled={isPrinting}
          className="min-h-[48px] rounded-xl bg-zinc-900 px-4 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isPrinting ? "出力準備中…" : "PDFで保存"}
        </button>
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
  const edge = COMPOSITE_EDGE_LABELS_JA[ckey];
  const framing =
    band && value !== null ? getCompositeLowFraming(ckey, band) : null;
  const unavailableFraming =
    "回答状況の関係で、この項目のコメントはまだ表示できません。";

  if (value === null || band === null) {
    return (
      <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-2">
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100">
            {label}
          </span>
          <span className="shrink-0 text-xs text-zinc-500">算出不可</span>
        </div>
        <div
          className="flex flex-col gap-1"
          aria-label={`スケール（算出不可）: 中央0、${edge.low}側 L0〜50、${edge.high}側 R0〜50`}
        >
          <div
            className="composite-bar-track h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-2 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
            <span className="min-w-0 text-left">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {edge.low}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500"> · L0〜50</span>
            </span>
            <span className="min-w-0 text-right">
              <span className="text-zinc-400 dark:text-zinc-500">R0〜50 · </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {edge.high}
              </span>
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
          {unavailableFraming}
        </p>
      </li>
    );
  }

  const lrText = formatCompositeLrDisplay(value);
  const { leftPct, widthPct } = compositeLrBarStyle(value);
  return (
    <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-2">
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100">
          {label}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
          {lrText}
        </span>
      </div>
      <div
        className="flex flex-col gap-1"
        aria-label={`スケール: 中央0、${edge.low}側 L0〜50、${edge.high}側 R0〜50。位置 ${lrText}`}
      >
        <div
          className="composite-bar-track relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 shadow-inner dark:bg-zinc-700 dark:shadow-none"
          role="presentation"
        >
          <div
            className="pointer-events-none absolute top-0 z-[1] h-full w-px -translate-x-px bg-zinc-400/90 dark:bg-zinc-500/90"
            style={{ left: "50%" }}
            aria-hidden
          />
          {widthPct > 0 && (
            <div
              className="composite-bar-fill absolute top-0 h-full min-w-px rounded-full bg-zinc-800 dark:bg-zinc-200"
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          )}
        </div>
        <div className="flex items-start justify-between gap-2 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
          <span className="min-w-0 max-w-[48%] text-left">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {edge.low}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500"> · L0〜50</span>
          </span>
          <span className="min-w-0 max-w-[48%] text-right">
            <span className="text-zinc-400 dark:text-zinc-500">R0〜50 · </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {edge.high}
            </span>
          </span>
        </div>
      </div>
      {framing && (
        <p className="mt-1.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
          {framing}
        </p>
      )}
    </li>
  );
}
