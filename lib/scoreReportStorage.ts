import { COMPOSITE_KEYS, SCORE_REPORT_SCHEMA_VERSION } from "@/lib/scoring/constants";
import type { ScoreReport } from "@/lib/scoring/types";

const KEY_REPORT = "locus-survey-report-v1";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isValidScoreReport(x: unknown): x is ScoreReport {
  if (!isRecord(x)) return false;
  if (x.schemaVersion !== SCORE_REPORT_SCHEMA_VERSION) return false;
  if (!isRecord(x.composites)) return false;
  for (const k of COMPOSITE_KEYS) {
    const v = x.composites[k];
    if (typeof v !== "number" && v !== null) return false;
  }
  if (!isRecord(x.dimensions)) return false;
  if (!isRecord(x.normalizedByQuestionId)) return false;
  if (!isRecord(x.bandByComposite)) return false;
  for (const k of COMPOSITE_KEYS) {
    const b = x.bandByComposite[k];
    if (typeof b !== "string" && b !== null) return false;
  }
  return true;
}

export function persistScoreReport(report: ScoreReport): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY_REPORT, JSON.stringify(report));
  } catch {
    /* ignore quota */
  }
}

export function loadScoreReport(): ScoreReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY_REPORT);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    return isValidScoreReport(data) ? data : null;
  } catch {
    return null;
  }
}

export function clearScoreReport(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY_REPORT);
  } catch {
    /* ignore */
  }
}

/** ストレージ検証用（テストで利用可） */
export function parseScoreReportForTest(raw: string): ScoreReport | null {
  try {
    const data: unknown = JSON.parse(raw);
    return isValidScoreReport(data) ? data : null;
  } catch {
    return null;
  }
}
