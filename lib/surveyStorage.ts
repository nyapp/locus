import type { AnswersMap } from "./types";

const KEY_ANSWERS = "locus-survey-answers-v1";
const KEY_INDEX = "locus-survey-index-v1";
const KEY_ORDER_IDS = "locus-survey-order-ids-v1";

export function loadPersistedSurvey(): {
  answers: AnswersMap;
  index: number;
  orderIds: number[] | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const rawA = sessionStorage.getItem(KEY_ANSWERS);
    const rawI = sessionStorage.getItem(KEY_INDEX);
    const rawO = sessionStorage.getItem(KEY_ORDER_IDS);
    if (!rawA && rawI === null) return null;
    const answers = rawA
      ? (JSON.parse(rawA) as AnswersMap)
      : {};
    const index = rawI !== null ? Number(rawI) : 0;
    const parsedOrder = rawO ? (JSON.parse(rawO) as unknown) : null;
    const orderIds = Array.isArray(parsedOrder)
      ? parsedOrder.filter((v): v is number => Number.isFinite(v))
      : null;
    return {
      answers,
      index: Number.isFinite(index) && index >= 0 ? index : 0,
      orderIds,
    };
  } catch {
    return null;
  }
}

export function persistSurvey(
  answers: AnswersMap,
  index: number,
  orderIds: number[],
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY_ANSWERS, JSON.stringify(answers));
    sessionStorage.setItem(KEY_INDEX, String(index));
    sessionStorage.setItem(KEY_ORDER_IDS, JSON.stringify(orderIds));
  } catch {
    /* ignore quota */
  }
}

export function clearPersistedSurvey(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY_ANSWERS);
    sessionStorage.removeItem(KEY_INDEX);
    sessionStorage.removeItem(KEY_ORDER_IDS);
  } catch {
    /* ignore */
  }
}
