import type { CompositeKey } from "./constants";
import type { CompositeScores, DimensionScores } from "./types";

function pick(
  d: DimensionScores,
  key: keyof DimensionScores,
): number | null {
  return d[key];
}

/** 式に使う下位軸のいずれかが null なら null（0 に置換しない） */
export function computeComposites(d: DimensionScores): CompositeScores {
  const O = pick(d, "Openness");
  const C = pick(d, "Conscientiousness");
  const E = pick(d, "Extraversion");
  const A = pick(d, "Agreeableness");
  const N = pick(d, "Neuroticism");
  const autonomy = pick(d, "Autonomy");
  const competence = pick(d, "Competence");
  const relatedness = pick(d, "Relatedness");
  const experience = pick(d, "Experience");
  const reflection = pick(d, "Reflection");
  const abstract_ = pick(d, "Abstract");
  const experiment = pick(d, "Experiment");

  const emotionalStability = N;

  const exploration =
    O !== null && experiment !== null && experience !== null
      ? 0.5 * O + 0.3 * experiment + 0.2 * experience
      : null;

  const persistence =
    C !== null &&
    competence !== null &&
    emotionalStability !== null &&
    reflection !== null
      ? 0.5 * C +
        0.2 * competence +
        0.15 * emotionalStability +
        0.15 * reflection
      : null;

  const intrinsicMotivation =
    autonomy !== null && competence !== null && relatedness !== null
      ? 0.5 * autonomy + 0.25 * competence + 0.25 * relatedness
      : null;

  const reflectionDepth =
    reflection !== null && abstract_ !== null && emotionalStability !== null
      ? 0.5 * reflection + 0.3 * abstract_ + 0.2 * emotionalStability
      : null;

  const execution =
    experience !== null &&
    experiment !== null &&
    E !== null &&
    C !== null
      ? 0.35 * experience +
        0.35 * experiment +
        0.1 * E +
        0.2 * C
      : null;

  const collaboration =
    relatedness !== null && A !== null && E !== null
      ? 0.4 * relatedness + 0.35 * A + 0.25 * E
      : null;

  const out: Record<CompositeKey, number | null> = {
    exploration,
    persistence,
    intrinsicMotivation,
    reflectionDepth,
    execution,
    collaboration,
  };
  return out;
}
