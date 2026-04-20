/** questions.csv の theory 列と一致（typo 防止・集計キー） */
export const THEORY_KEYS = [
  "Openness",
  "Conscientiousness",
  "Extraversion",
  "Agreeableness",
  "Neuroticism",
  "Autonomy",
  "Competence",
  "Relatedness",
  "Experience",
  "Reflection",
  "Abstract",
  "Experiment",
  "Balance",
] as const;

export type TheoryKey = (typeof THEORY_KEYS)[number];

const THEORY_SET = new Set<string>(THEORY_KEYS);

/** CSV に未知の theory があれば集計から除外する（下位軸は null 扱い） */
export function isTheoryKey(s: string): s is TheoryKey {
  return THEORY_SET.has(s);
}

export const COMPOSITE_KEYS = [
  "exploration",
  "intrinsicMotivation",
  "execution",
  "persistence",
  "reflectionDepth",
  "collaboration",
] as const;

export type CompositeKey = (typeof COMPOSITE_KEYS)[number];

/** 同点時: 配列の若いインデックスが上位（スコア降順の二次キー） */
export const COMPOSITE_TIE_BREAK_ORDER = [
  "exploration",
  "intrinsicMotivation",
  "execution",
  "persistence",
  "reflectionDepth",
  "collaboration",
] as const satisfies readonly CompositeKey[];

/** ScoreReport・sessionStorage の互換用。係数・null 仕様・タイブレーク変更時に上げる */
export const SCORE_REPORT_SCHEMA_VERSION = 1;
