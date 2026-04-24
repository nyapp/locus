import type { AnswersMap, Question } from "../types";
import { COMPOSITE_KEYS, SCORE_REPORT_SCHEMA_VERSION } from "./constants";
import { computeBandByComposite } from "./bands";
import { computeComposites } from "./composites";
import {
  buildNormalizedByQuestionId,
  computeDimensionScores,
} from "./dimensions";
import type { ScoreReport } from "./types";
import { computeTop3TypeLabels } from "./typeLabels";

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
