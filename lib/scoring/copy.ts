import type { CompositeKey } from "./constants";
import type { BandId } from "./types";

/** 各帯の言い換え（短所の断定ではなく、次の行動を促す補助文） */
const BAND_FRAMING: Record<CompositeKey, Record<BandId, string>> = {
  exploration: {
    veryLow: "安定したやり方や既存のパターンに留まりやすい傾向",
    low: "慣れた方法を土台にしつつ、試す幅を広げられる余地がある傾向",
    medium: "目的に応じて安定と探索を切り替えられる傾向",
    high: "新しい試行を学びに取り込み、改善を回しやすい傾向",
    veryHigh: "未知への挑戦を継続的な成長につなげやすい傾向",
  },
  persistence: {
    veryLow: "気分や不安の影響で止まりやすい傾向",
    low: "続けるには環境づくりが効きやすい傾向",
    medium: "ペースを整えると無理なく継続しやすい傾向",
    high: "計画と習慣を使って学習を積み上げやすい傾向",
    veryHigh: "長期目標に向けて粘り強く継続できる傾向",
  },
  intrinsicMotivation: {
    veryLow: "評価や指示に応じて動きやすい傾向",
    low: "意味づけを補うと自分から動きやすくなる傾向",
    medium: "意味づけと成果の実感を両立して取り組める傾向",
    high: "自分なりの目的を持つと主体的に深めやすい傾向",
    veryHigh: "内発的な関心をエネルギーに学びを広げやすい傾向",
  },
  reflectionDepth: {
    veryLow: "まず行動して振り返りは後回しになりやすい傾向",
    low: "振り返りの型を持つと学びの抽出がしやすい傾向",
    medium: "行動と振り返りをバランスよく往復できる傾向",
    high: "振り返りから改善点を見つけて次に活かしやすい傾向",
    veryHigh: "学びを構造化して再現可能な知見に高めやすい傾向",
  },
  execution: {
    veryLow: "考え込んで着手が遅れやすい傾向",
    low: "小さく始めると動き出しやすい傾向",
    medium: "考える時間と着手の切り替えを取りやすい傾向",
    high: "小さく実行して前進を作るのが得意な傾向",
    veryHigh: "仮説を素早く形にして検証を進めやすい傾向",
  },
  collaboration: {
    veryLow: "一人で集中すると力を出しやすい傾向",
    low: "少人数や非同期の協働が合いやすい傾向",
    medium: "必要に応じて個人作業と協働を使い分けられる傾向",
    high: "他者との連携を学習成果に結びつけやすい傾向",
    veryHigh: "対話と共創を通じて学びを加速しやすい傾向",
  },
};

export function getCompositeLowFraming(
  key: CompositeKey,
  band: BandId,
): string {
  return BAND_FRAMING[key][band];
}
