/** 回答は UI 上で選んだ生の値（1〜5）。集計時に reverse を見て変換する。 */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type Question = {
  id: number;
  category: string;
  theory: string;
  dimension: string;
  question: string;
  /** 1 = 逆転項目（集計時 0〜100 正規化で (5−v)/4×100） */
  reverse: 0 | 1;
};

export type ScaleOption = {
  value: LikertValue;
  label: string;
};

export type AnswersMap = Partial<Record<number, LikertValue>>;
