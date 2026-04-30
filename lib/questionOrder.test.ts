import { describe, expect, it } from "vitest";
import { applyPersistedQuestionOrder, buildOptimizedQuestionOrder } from "./questionOrder";
import type { Question } from "./types";

function makeQuestion(
  id: number,
  category: string,
  theory: string,
  reverse: 0 | 1,
): Question {
  return {
    id,
    category,
    theory,
    dimension: "x",
    question: "x",
    reverse,
  };
}

describe("buildOptimizedQuestionOrder", () => {
  it("同一 theory 連続を可能な範囲で避ける", () => {
    const questions: Question[] = [
      makeQuestion(1, "BigFive", "Openness", 0),
      makeQuestion(2, "BigFive", "Openness", 1),
      makeQuestion(3, "SDT", "Autonomy", 0),
      makeQuestion(4, "SDT", "Autonomy", 1),
      makeQuestion(5, "Kolb", "Experience", 0),
      makeQuestion(6, "Kolb", "Experience", 1),
    ];

    const ordered = buildOptimizedQuestionOrder(questions, () => 0);
    for (let i = 1; i < ordered.length; i += 1) {
      expect(ordered[i].theory).not.toBe(ordered[i - 1].theory);
    }
  });

  it("設問集合を欠損なく並び替える", () => {
    const questions: Question[] = [
      makeQuestion(11, "BigFive", "Extraversion", 0),
      makeQuestion(12, "SDT", "Competence", 1),
      makeQuestion(13, "Kolb", "Reflection", 0),
    ];

    const ordered = buildOptimizedQuestionOrder(questions, () => 0.1);
    expect(ordered).toHaveLength(questions.length);
    expect(ordered.map((q) => q.id).sort((a, b) => a - b)).toEqual([11, 12, 13]);
  });

  it("同一 theory の3連続を回避する", () => {
    const questions: Question[] = [
      makeQuestion(1, "BigFive", "Openness", 0),
      makeQuestion(2, "BigFive", "Openness", 1),
      makeQuestion(3, "BigFive", "Openness", 0),
      makeQuestion(4, "SDT", "Autonomy", 0),
      makeQuestion(5, "Kolb", "Experience", 1),
      makeQuestion(6, "SDT", "Relatedness", 0),
    ];

    const ordered = buildOptimizedQuestionOrder(questions, () => 0);
    for (let i = 2; i < ordered.length; i += 1) {
      const a = ordered[i - 2].theory;
      const b = ordered[i - 1].theory;
      const c = ordered[i].theory;
      expect(!(a === b && b === c)).toBe(true);
    }
  });
});

describe("applyPersistedQuestionOrder", () => {
  const questions: Question[] = [
    makeQuestion(1, "BigFive", "Openness", 0),
    makeQuestion(2, "SDT", "Autonomy", 1),
    makeQuestion(3, "Kolb", "Abstract", 0),
  ];

  it("保存済み id 順を復元する", () => {
    const restored = applyPersistedQuestionOrder(questions, [3, 1, 2]);
    expect(restored?.map((q) => q.id)).toEqual([3, 1, 2]);
  });

  it("id 数不一致なら null", () => {
    const restored = applyPersistedQuestionOrder(questions, [3, 1]);
    expect(restored).toBeNull();
  });

  it("未知 id を含むと null", () => {
    const restored = applyPersistedQuestionOrder(questions, [3, 1, 999]);
    expect(restored).toBeNull();
  });
});
