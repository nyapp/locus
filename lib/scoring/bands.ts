import { COMPOSITE_KEYS } from "./constants";
import type { BandByComposite, BandId, CompositeScores } from "./types";

export function bandIdFromScore(score: number): BandId {
  if (score < 40) return "veryLow";
  if (score < 60) return "low";
  if (score < 75) return "medium";
  if (score < 90) return "high";
  return "veryHigh";
}

export const BAND_LABEL_JA: Record<BandId, string> = {
  veryLow: "低め",
  low: "やや低め",
  medium: "中程度",
  high: "高め",
  veryHigh: "非常に高い",
};

export function computeBandByComposite(
  composites: CompositeScores,
): BandByComposite {
  const out = {} as BandByComposite;
  for (const k of COMPOSITE_KEYS) {
    const v = composites[k];
    out[k] = v === null ? null : bandIdFromScore(v);
  }
  return out;
}
