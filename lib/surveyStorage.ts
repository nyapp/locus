import type { AnswersMap } from "./types";

const KEY_ANSWERS = "locus-survey-answers-v1";
const KEY_INDEX = "locus-survey-index-v1";

export function loadPersistedSurvey(): {
  answers: AnswersMap;
  index: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const rawA = sessionStorage.getItem(KEY_ANSWERS);
    const rawI = sessionStorage.getItem(KEY_INDEX);
    if (!rawA && rawI === null) return null;
    const answers = rawA
      ? (JSON.parse(rawA) as AnswersMap)
      : {};
    const index = rawI !== null ? Number(rawI) : 0;
    return {
      answers,
      index: Number.isFinite(index) && index >= 0 ? index : 0,
    };
  } catch {
    return null;
  }
}

export function persistSurvey(answers: AnswersMap, index: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY_ANSWERS, JSON.stringify(answers));
    sessionStorage.setItem(KEY_INDEX, String(index));
  } catch {
    /* ignore quota */
  }
}

export function clearPersistedSurvey(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY_ANSWERS);
    sessionStorage.removeItem(KEY_INDEX);
  } catch {
    /* ignore */
  }
}
