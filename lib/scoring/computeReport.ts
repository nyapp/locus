import type { AnswersMap, Question } from "../types";
import { COMPOSITE_KEYS, SCORE_REPORT_SCHEMA_VERSION } from "./constants";
import { computeBandByComposite } from "./bands";
import { computeComposites } from "./composites";
import {
  buildNormalizedByQuestionId,
  computeDimensionScores,
} from "./dimensions";
import type { ScoreReport } from "./types";
import { computeArchetypeLabel, computeTop3TypeLabels } from "./typeLabels";

/**
 * null 伝播（一文仕様）:
 * 属する設問が 1 件もない下位軸（theory）のスコアは null とし、ある解釈用指標の式に登場する下位軸のうちいずれかが null のときその解釈用指標は null とし、加重平均などで null を数値に置換しない。
 * 方式 C: 解釈用指標 6 個がすべて有限のときのみ上位 3 タイプラベルを選ぶ。いずれか null なら type も null。
 */
export function computeScoreReport(
  questions: Question[],
  answers: AnswersMap,
): ScoreReport {
  const normalizedByQuestionId = buildNormalizedByQuestionId(
    questions,
    answers,
  );
  const dimensions = computeDimensionScores(questions, normalizedByQuestionId);
  const emotionalStability = dimensions.Neuroticism;
  const emotionalReactivity =
    emotionalStability === null ? null : 100 - emotionalStability;

  const composites = computeComposites(dimensions);
  const bandByComposite = computeBandByComposite(composites);
  const top3 = computeTop3TypeLabels(composites);
  const archetype = computeArchetypeLabel(composites);

  return {
    schemaVersion: SCORE_REPORT_SCHEMA_VERSION,
    normalizedByQuestionId,
    dimensions,
    emotionalStability,
    emotionalReactivity,
    composites,
    bandByComposite,
    typeLabelParts: top3?.parts ?? null,
    typeLine: top3?.line ?? null,
    archetypeKey: archetype?.key ?? null,
    archetypeLabelJa: archetype?.label ?? null,
    archetypeConfidence: archetype?.confidence ?? null,
    archetypeReasons: archetype?.reasons ?? null,
  };
}

/** 表示用: 解釈指標の日本語名 */
export const COMPOSITE_LABEL_JA: Record<(typeof COMPOSITE_KEYS)[number], string> =
  {
    exploration: "探索・安定化傾向",
    persistence: "学習継続傾向",
    intrinsicMotivation: "動機源傾向",
    reflectionDepth: "省察活用傾向",
    execution: "実行移行傾向",
    collaboration: "協働活用傾向",
  };

/** スコアバー両端: 低い側（左）・高い側（右）。合成式・copy の傾向に合わせた短ラベル */
export const COMPOSITE_EDGE_LABELS_JA: Record<
  (typeof COMPOSITE_KEYS)[number],
  { low: string; high: string }
> = {
  exploration: { low: "安定重視", high: "探索重視" },
  persistence: { low: "状況依存", high: "継続志向" },
  intrinsicMotivation: { low: "外的動機", high: "内的動機" },
  reflectionDepth: { low: "行動先行", high: "省察活用" },
  execution: { low: "熟考先行", high: "実行先行" },
  collaboration: { low: "個別遂行", high: "協働遂行" },
};
