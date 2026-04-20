import type { AnswersMap, Question } from "../types";
import { isTheoryKey, type TheoryKey, THEORY_KEYS } from "./constants";
import { normalizeItemScore } from "./normalize";
import type { DimensionScores, NormalizedByQuestionId } from "./types";

export function buildNormalizedByQuestionId(
  questions: Question[],
  answers: AnswersMap,
): NormalizedByQuestionId {
  const out: NormalizedByQuestionId = {};
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    out[q.id] = normalizeItemScore(v, q.reverse);
  }
  return out;
}

/** 同一 theory の正規化スコア平均。該当設問の回答が 1 件もなければ null */
export function computeDimensionScores(
  questions: Question[],
  normalizedByQuestionId: NormalizedByQuestionId,
): DimensionScores {
  const sums: Partial<Record<TheoryKey, number>> = {};
  const counts: Partial<Record<TheoryKey, number>> = {};

  for (const q of questions) {
    if (!isTheoryKey(q.theory)) continue;
    const n = normalizedByQuestionId[q.id];
    if (n === undefined) continue;
    sums[q.theory] = (sums[q.theory] ?? 0) + n;
    counts[q.theory] = (counts[q.theory] ?? 0) + 1;
  }

  const result = {} as DimensionScores;
  for (const t of THEORY_KEYS) {
    const c = counts[t];
    if (!c) result[t] = null;
    else result[t] = (sums[t] ?? 0) / c;
  }
  return result;
}
