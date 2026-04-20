import type { CompositeKey } from "./constants";
import type { BandId } from "./types";

/** 低め帯向けの言い換え（「低い＝悪い」に読めないように） */
const LOW_FRAMING: Record<
  CompositeKey,
  { veryLow: string; low: string }
> = {
  exploration: {
    veryLow: "安定したやり方や既存のパターンに留まりやすい傾向",
    low: "慣れた方法を土台にしつつ、試す幅を広げられる余地がある傾向",
  },
  persistence: {
    veryLow: "気分や不安の影響で止まりやすい傾向",
    low: "続けるには環境づくりが効きやすい傾向",
  },
  intrinsicMotivation: {
    veryLow: "評価や指示に応じて動きやすい傾向",
    low: "意味づけを補うと自分から動きやすくなる傾向",
  },
  reflectionDepth: {
    veryLow: "まず行動して振り返りは後回しになりやすい傾向",
    low: "振り返りの型を持つと学びの抽出がしやすい傾向",
  },
  execution: {
    veryLow: "考え込んで着手が遅れやすい傾向",
    low: "小さく始めると動き出しやすい傾向",
  },
  collaboration: {
    veryLow: "一人で集中すると力を出しやすい傾向",
    low: "少人数や非同期の協働が合いやすい傾向",
  },
};

export function getCompositeLowFraming(
  key: CompositeKey,
  band: BandId,
): string | null {
  if (band !== "veryLow" && band !== "low") return null;
  const row = LOW_FRAMING[key];
  return band === "veryLow" ? row.veryLow : row.low;
}
