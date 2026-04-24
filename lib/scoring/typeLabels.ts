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

export const ARCHETYPE_LABEL_JA: Record<CompositeKey, string> = {
  exploration: "未踏への進軍",
  persistence: "不動の信念",
  intrinsicMotivation: "魂の咆哮",
  reflectionDepth: "真理の追究",
  execution: "刹那の決断",
  collaboration: "連帯の誓い",
};

export const ARCHETYPE_ANALYSIS_JA: Record<CompositeKey, string> = {
  exploration:
    "既存の知識に安住せず、境界線を越えて情報を取りに行く資質。不確実な状況下でも「まず知る」ことを優先し、学習のフロンティアを拡張する起点となる力を指す。",
  persistence:
    "難易度の高い課題や長期的なプロジェクトにおいて、一貫性を維持する力。外部の圧力や停滞に屈せず、設定したゴールまでリソースを配分し続ける完遂能力を証明している。",
  intrinsicMotivation:
    "報酬や強制といった外部要因に依存せず、内的な興味から行動を生成する源泉。自律的な学習サイクルを駆動させるための「最も純度の高いエネルギー」の保有量を示す。",
  reflectionDepth:
    "経験を単なる「過去の出来事」に留めず、抽象化して法則性を導き出すメタ認知能力。表面的な事象の奥にある構造を捉え、再現性のある知恵へと変換する深さを表す。",
  execution:
    "思考を現実の行動へと変換するまでのタイムラグ（CT）の短さ。仮説を素早く具現化し、実社会や環境からのフィードバックを得るための「社会実装における機動力」を意味する。",
  collaboration:
    "他者の資質を認め、自己の能力と掛け合わせることで全体出力を最大化させる調整力。個の限界を理解した上で、組織的な成果を導き出すための「共創のプラットフォーム」としての適性。",
};

export type ArchetypeResult = {
  key: CompositeKey;
  label: string;
  confidence: number;
  reasons: [string, string, string];
  topKeys: [CompositeKey, CompositeKey, CompositeKey];
  topScores: [number, number, number];
  deltaTop1Top2: number;
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

/**
 * 6 指標すべて数値のときのみ単一ラベルを算出する。
 * 同点時は COMPOSITE_TIE_BREAK_ORDER の若い方を優先する。
 */
export function computeArchetypeLabel(
  composites: CompositeScores,
): ArchetypeResult | null {
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
  const topKeys: [CompositeKey, CompositeKey, CompositeKey] = [
    top[0][0],
    top[1][0],
    top[2][0],
  ];
  const topScores: [number, number, number] = [top[0][1], top[1][1], top[2][1]];
  const key = topKeys[0];
  const label = ARCHETYPE_LABEL_JA[key];
  const deltaTop1Top2 = Number((topScores[0] - topScores[1]).toFixed(2));
  const confidence = deltaTop1Top2;
  const reasons: [string, string, string] = [
    `${key}: ${Math.round(topScores[0])}`,
    `${topKeys[1]}: ${Math.round(topScores[1])}`,
    `${topKeys[2]}: ${Math.round(topScores[2])}`,
  ];

  return {
    key,
    label,
    confidence,
    reasons,
    topKeys,
    topScores,
    deltaTop1Top2,
  };
}
