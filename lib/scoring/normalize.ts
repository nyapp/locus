import type { LikertValue } from "../types";

/**
 * 設問単位の 0〜100 正規化（高いほど望ましい方向に揃える）。
 * reverse === 1 のとき逆転式。
 */
export function normalizeItemScore(
  v: LikertValue,
  reverse: 0 | 1,
): number {
  if (reverse === 1) return ((5 - v) / 4) * 100;
  return ((v - 1) / 4) * 100;
}
