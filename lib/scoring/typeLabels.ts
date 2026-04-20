import { COMPOSITE_KEYS, COMPOSITE_TIE_BREAK_ORDER, type CompositeKey } from "./constants";
import type { CompositeScores } from "./types";

export const COMPOSITE_TYPE_SUFFIX: Record<CompositeKey, string> = {
  exploration: "探究型",
  persistence: "継続型",
  intrinsicMotivation: "自律駆動",
  reflectionDepth: "内省型",
  execution: "実験優位",
  collaboration: "協働型",
};

export type Top3TypeResult = {
  keys: [CompositeKey, CompositeKey, CompositeKey];
  parts: [string, string, string];
  line: string;
};

/**
 * 6 指標すべて数値のときのみ。スコア降順、同点は COMPOSITE_TIE_BREAK_ORDER の若い方が上位。
 */
export function computeTop3TypeLabels(
  composites: CompositeScores,
): Top3TypeResult | null {
  for (const k of COMPOSITE_KEYS) {
    if (composites[k] === null) return null;
  }

  const entries = COMPOSITE_KEYS.map((k) => [k, composites[k]!] as const);
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (
      COMPOSITE_TIE_BREAK_ORDER.indexOf(a[0]) -
      COMPOSITE_TIE_BREAK_ORDER.indexOf(b[0])
    );
  });

  const top = entries.slice(0, 3) as [
    [CompositeKey, number],
    [CompositeKey, number],
    [CompositeKey, number],
  ];
  const keys: [CompositeKey, CompositeKey, CompositeKey] = [
    top[0][0],
    top[1][0],
    top[2][0],
  ];
  const parts: [string, string, string] = [
    COMPOSITE_TYPE_SUFFIX[keys[0]],
    COMPOSITE_TYPE_SUFFIX[keys[1]],
    COMPOSITE_TYPE_SUFFIX[keys[2]],
  ];
  return { keys, parts, line: parts.join(" × ") };
}
