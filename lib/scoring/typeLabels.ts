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
    "あなたは、「なぜそうなるのか」を理解してから進みたくなるタイプです。\nわからないことがあると、自分で調べたり、人に聞いたりして確かめようとします。\n新しい資料では、目次や用語から先に確認することも多いでしょう。\n\nこれは、新しい情報への興味が強く、あいまいなままにできないからです。\nそのため、調べすぎて作業のスタートが遅れることがあります。\n一方で、誰よりも早く新しい分野に触れられる強みがあります。\n\n「不確実」と感じたときは、「まだ答えを書いていないメモがある状態」と考えてください。\nまずは、5分だけタイマーを使い、信頼できる情報を1つ確認してください。\n\n今わかっていることと、まだ空白のまま残っている部分は、それぞれどこですか？",
  persistence:
    "あなたは、結果がすぐに見えなくても、決めたことを続けられるタイプです。\nやることを書き出してから動くと、安定して進めやすくなります。\n\nこれは、長く続けることに価値を感じやすく、途中で止まるのが苦手だからです。\nそのため、やり方を変えるのが遅れて、負担がたまることがあります。\n一方で、難しい課題でも最後までやり切る力があります。\n\n「続ける」とは、「同じ条件で繰り返すこと」です。\nまずは、毎日同じ時間に15分だけ作業する時間を決めてください。\n\nその時間を続けたとき、どの部分が変わり、どの部分は変わらず残りそうですか？",
  intrinsicMotivation:
    "あなたは、評価や点数よりも、「自分が納得できるか」を大事にするタイプです。\n興味のあることには、時間を忘れて取り組むことができます。\n\nこれは、自分の内側の興味が行動のきっかけになっているからです。\nそのため、正解がはっきりしない課題では迷いが長くなることがあります。\n一方で、自分で決めて進める学びには強さがあります。\n\n「自分で決める」とは、「やる範囲を自分で区切ること」です。\nまずは、今日の作業で「ここまでやる」と1行で決めてください。\n\nその基準を決めたとき、自分が納得している理由はどこにありますか？",
  reflectionDepth:
    "あなたは、経験をふり返り、「なぜそうなったか」まで考えるタイプです。\n出来事だけでなく、理由や条件まで言葉にしようとします。\n\nこれは、同じ失敗を繰り返したくないという意識が強いからです。\nそのため、考えすぎて行動が遅れることがあります。\n一方で、物事をわかりやすく説明する力があります。\n\n「振り返り」とは、「次にうまくいく形に変えること」です。\nまずは、5分だけ振り返り、手順を3つにまとめてください。\n\nその手順の中で、結果に最も影響していたポイントはどこにありますか？",
  execution:
    "あなたは、考えながら手を動かすタイプです。\nまず試してみて、あとから直す進め方が得意です。\n\nこれは、実際に動かすことで理解が深まるからです。\nそのため、準備不足でやり直しが増えることがあります。\n一方で、早く結果を出してフィードバックを得られる強みがあります。\n\n「すぐ動く」とは、「最初の一歩を決めること」です。\nまずは、30秒以内にやることを1つ決めてください。\n\nその一歩は、どの仮説を確かめるための行動になっていますか？",
  collaboration:
    "あなたは、人の得意・不得意を見て、役割を考えながら進めるタイプです。\n始める前に、短く確認を取りたくなることが多いでしょう。\n\nこれは、協力によって成果が良くなると感じているからです。\nそのため、一人で進められる場面でも手間が増えることがあります。\n一方で、チームでの仕事では大きな力を発揮します。\n\n「協力する」とは、「相手が動きやすい形で伝えること」です。\nまずは、「期限・内容・判断する人」を1つのメッセージで伝えてください。\n\nその依頼の中で、相手が迷いそうなポイントはどこに残っていますか？",
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
