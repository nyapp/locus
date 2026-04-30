import type { Question } from "./types";

type RandomFn = () => number;

/**
 * セッション開始時の出題順を最適化する。
 * - 直前の設問と theory/category が連続しすぎないように優先
 * - reverse 項目が連続しすぎないように緩く分散
 */
export function buildOptimizedQuestionOrder(
  questions: Question[],
  random: RandomFn = Math.random,
): Question[] {
  if (questions.length <= 2) return [...questions];

  const remaining = [...questions];
  const ordered: Question[] = [];

  const firstIndex = Math.floor(random() * remaining.length);
  ordered.push(remaining.splice(firstIndex, 1)[0]);

  while (remaining.length > 0) {
    const prev = ordered[ordered.length - 1];
    const prev2 = ordered[ordered.length - 2];
    const blocksSameTheory = Boolean(
      prev &&
        prev2 &&
        prev.theory === prev2.theory &&
        remaining.some((q) => q.theory !== prev.theory),
    );

    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];

      // ハード制約: 可能な限り同一 theory の 3 連続を作らない。
      if (blocksSameTheory && candidate.theory === prev.theory) {
        continue;
      }

      let score = 0;

      if (candidate.theory === prev.theory) score -= 9;
      else score += 6;

      if (candidate.category === prev.category) score -= 3;
      else score += 2;

      if (candidate.reverse !== prev.reverse) score += 2;

      if (prev2) {
        if (candidate.theory !== prev2.theory) score += 2;
        if (candidate.category !== prev2.category) score += 1;
        if (
          candidate.reverse === prev.reverse &&
          candidate.reverse === prev2.reverse
        ) {
          score -= 3;
        }
      }

      score += random() * 0.25;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  return ordered;
}

/** 永続化済みの id 順から Question 配列を復元する。 */
export function applyPersistedQuestionOrder(
  questions: Question[],
  orderedIds: number[],
): Question[] | null {
  if (questions.length === 0) return [];
  if (orderedIds.length !== questions.length) return null;

  const byId = new Map<number, Question>();
  for (const q of questions) byId.set(q.id, q);

  const restored: Question[] = [];
  for (const id of orderedIds) {
    const q = byId.get(id);
    if (!q) return null;
    restored.push(q);
  }
  return restored;
}
