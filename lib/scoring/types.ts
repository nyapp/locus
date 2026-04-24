import type { CompositeKey, TheoryKey } from "./constants";
import type { ArchetypeConfidenceBand } from "./typeLabels";

export type BandId =
  | "veryLow"
  | "low"
  | "medium"
  | "high"
  | "veryHigh";

export type DimensionScores = Record<TheoryKey, number | null>;

export type CompositeScores = Record<CompositeKey, number | null>;

export type BandByComposite = Record<CompositeKey, BandId | null>;

/** 設問 id → 正規化 0〜100 */
export type NormalizedByQuestionId = Record<number, number>;

/**
 * 集計結果（永続化単位）。
 * null 伝播仕様は computeReport のコメントに準拠。
 */
export type ScoreReport = {
  schemaVersion: number;
  normalizedByQuestionId: NormalizedByQuestionId;
  dimensions: DimensionScores;
  /** Neuroticism 平均＝情緒的安定。null は Neuroticism が算出不可のとき */
  emotionalStability: number | null;
  /** 100 − emotionalStability。素材レーダー用 */
  emotionalReactivity: number | null;
  composites: CompositeScores;
  bandByComposite: BandByComposite;
  /** 方式 C: 6 指標すべて有限のときのみ */
  typeLabelParts: [string, string, string] | null;
  typeLine: string | null;
  archetypeKey: CompositeKey | null;
  archetypeLabelJa: string | null;
  archetypeConfidence: number | null;
  archetypeConfidenceBand: ArchetypeConfidenceBand | null;
  archetypeReasons: [string, string, string] | null;
};
