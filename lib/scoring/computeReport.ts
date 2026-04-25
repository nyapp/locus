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
    exploration: "進んで挑戦する力",
    persistence: "最後までやり抜く力",
    intrinsicMotivation: "内側から湧く主体性",
    reflectionDepth: "内省して糧にする力",
    execution: "実行する行動力",
    collaboration: "他人と協力できる力",
  };

/** スコアバー両端: 低い側（左）・高い側（右）。合成式・copy の傾向に合わせた短ラベル */
export const COMPOSITE_EDGE_LABELS_JA: Record<
  (typeof COMPOSITE_KEYS)[number],
  { low: string; high: string }
> = {
  exploration: { low: "堅守力", high: "挑戦力" },
  persistence: { low: "環境依拠力", high: "継続力" },
  intrinsicMotivation: { low: "外発力", high: "内発力" },
  reflectionDepth: { low: "先行力", high: "省察力" },
  execution: { low: "思案力", high: "実行力" },
  collaboration: { low: "自走力", high: "協働力" },
};
