/**
 * 合成スコア（0–100）を、中央 50 を 0 とみなした L0–50 / R0–50 の離れ度で表す。
 * 帯や集計は従来どおり raw 0–100 のまま。表示専用。
 */
export type CompositeLrDeviation =
  | { side: "L"; magnitude: number }
  | { side: "R"; magnitude: number }
  | { side: "center"; magnitude: 0 };

export function compositeRawToLrDeviation(raw: number): CompositeLrDeviation {
  const v = Math.round(Math.min(100, Math.max(0, raw)));
  if (v === 50) return { side: "center", magnitude: 0 };
  if (v < 50) return { side: "L", magnitude: 50 - v };
  return { side: "R", magnitude: v - 50 };
}

/** 例: L12 / R0 / R8 / 0 */
export function formatCompositeLrDisplay(raw: number): string {
  const d = compositeRawToLrDeviation(raw);
  if (d.side === "center") return "0";
  return `${d.side}${d.magnitude}`;
}

/** 中央基準バー用: 塗り左端・幅（%）。トラック幅に対する割合 */
export function compositeLrBarStyle(raw: number): {
  leftPct: number;
  widthPct: number;
} {
  const v = Math.round(Math.min(100, Math.max(0, raw)));
  if (v === 50) return { leftPct: 50, widthPct: 0 };
  if (v < 50) {
    const widthPct = ((50 - v) / 50) * 50;
    const leftPct = (v / 50) * 50;
    return { leftPct, widthPct };
  }
  const widthPct = ((v - 50) / 50) * 50;
  return { leftPct: 50, widthPct };
}
