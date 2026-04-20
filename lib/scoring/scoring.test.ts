import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import { computeComposites } from "./composites";
import { computeDimensionScores, buildNormalizedByQuestionId } from "./dimensions";
import { normalizeItemScore } from "./normalize";
import { COMPOSITE_TIE_BREAK_ORDER, type TheoryKey } from "./constants";
import { computeTop3TypeLabels } from "./typeLabels";
import type { DimensionScores } from "./types";

describe("normalizeItemScore", () => {
  it("通常項目: 1→0, 5→100", () => {
    expect(normalizeItemScore(1, 0)).toBe(0);
    expect(normalizeItemScore(5, 0)).toBe(100);
    expect(normalizeItemScore(3, 0)).toBe(50);
  });

  it("逆転項目: 1→100, 5→0", () => {
    expect(normalizeItemScore(1, 1)).toBe(100);
    expect(normalizeItemScore(5, 1)).toBe(0);
    expect(normalizeItemScore(3, 1)).toBe(50);
  });
});

describe("computeTop3TypeLabels tie-break", () => {
  it("同点のとき COMPOSITE_TIE_BREAK_ORDER の若い方が上位", () => {
    const composites = {
      exploration: 50,
      persistence: 50,
      intrinsicMotivation: 50,
      reflectionDepth: 50,
      execution: 50,
      collaboration: 50,
    };
    const r = computeTop3TypeLabels(composites);
    expect(r).not.toBeNull();
    expect(r!.keys[0]).toBe(COMPOSITE_TIE_BREAK_ORDER[0]);
    expect(r!.keys[1]).toBe(COMPOSITE_TIE_BREAK_ORDER[1]);
    expect(r!.keys[2]).toBe(COMPOSITE_TIE_BREAK_ORDER[2]);
  });
});

describe("null 伝播", () => {
  it("Neuroticism が null のとき persistence と reflectionDepth も null", () => {
    const d = {} as DimensionScores;
    const theories: TheoryKey[] = [
      "Openness",
      "Conscientiousness",
      "Extraversion",
      "Agreeableness",
      "Neuroticism",
      "Autonomy",
      "Competence",
      "Relatedness",
      "Experience",
      "Reflection",
      "Abstract",
      "Experiment",
      "Balance",
    ];
    for (const t of theories) {
      d[t] = t === "Neuroticism" ? null : 50;
    }
    const c = computeComposites(d);
    expect(c.persistence).toBeNull();
    expect(c.reflectionDepth).toBeNull();
    expect(c.exploration).toBe(50);
  });
});

describe("Neuroticism 正規化後の平均（安定寄り）", () => {
  const neuroQuestions: Question[] = [21, 22, 23, 24, 25].map((id) => ({
    id,
    category: "BigFive",
    theory: "Neuroticism",
    dimension: "感情安定性",
    question: "x",
    reverse: id === 24 ? (0 as const) : (1 as const),
  }));

  it("不安が弱くストレス耐性が高い回答なら安定スコアは高い", () => {
    const answers = {
      21: 1 as const,
      22: 1 as const,
      23: 1 as const,
      24: 5 as const,
      25: 1 as const,
    };
    const norm = buildNormalizedByQuestionId(neuroQuestions, answers);
    const dims = computeDimensionScores(neuroQuestions, norm);
    expect(dims.Neuroticism).not.toBeNull();
    expect(dims.Neuroticism!).toBeGreaterThan(90);
  });

  it("不安が強い回答なら安定スコアは低い", () => {
    const answers = {
      21: 5 as const,
      22: 5 as const,
      23: 5 as const,
      24: 1 as const,
      25: 5 as const,
    };
    const norm = buildNormalizedByQuestionId(neuroQuestions, answers);
    const dims = computeDimensionScores(neuroQuestions, norm);
    expect(dims.Neuroticism).not.toBeNull();
    expect(dims.Neuroticism!).toBeLessThan(15);
  });
});
