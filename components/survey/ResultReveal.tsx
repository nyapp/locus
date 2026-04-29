"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ScoreReport } from "@/lib/scoring/types";
import type { CompositeKey } from "@/lib/scoring";

type Props = {
  report: ScoreReport;
  onSkip: () => void;
};

const ARCHETYPE_IMAGE_PATH: Record<CompositeKey, string> = {
  exploration: "/images/archetype-exploration.png",
  persistence: "/images/archetype-persistence.png",
  intrinsicMotivation: "/images/archetype-intrinsic-motivation.png",
  reflectionDepth: "/images/archetype-reflection-depth.png",
  execution: "/images/archetype-execution.png",
  collaboration: "/images/archetype-collaboration.png",
};

export function ResultReveal({ report, onSkip }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const archetypeImagePath = useMemo(() => {
    if (!report.archetypeKey) return null;
    return ARCHETYPE_IMAGE_PATH[report.archetypeKey];
  }, [report.archetypeKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    applyPreference();
    mediaQuery.addEventListener("change", applyPreference);
    return () => {
      mediaQuery.removeEventListener("change", applyPreference);
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  return (
    <section className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <p
        className="text-sm text-zinc-500 dark:text-zinc-400"
        aria-live="polite"
        role="status"
      >
        {report.archetypeLabelJa
          ? `あなたの学習アーキタイプは『${report.archetypeLabelJa}』です。`
          : "あなたの学習アーキタイプを判定しています。"}
      </p>

      <div className="w-full max-w-[19rem] [perspective:1200px]">
        <div
          className={[
            "overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-lg transition-all duration-700 ease-out dark:border-zinc-700 dark:bg-zinc-900/50",
            isAnimating
              ? "opacity-100 [transform:translateY(0)_scale(1)_rotateX(0deg)]"
              : "opacity-0 [transform:translateY(1.5rem)_scale(.95)_rotateX(6deg)]",
          ].join(" ")}
        >
          {archetypeImagePath ? (
            <Image
              src={`${basePath}${archetypeImagePath}`}
              alt={`${report.archetypeLabelJa ?? "診断"}のカードイラスト`}
              width={674}
              height={1024}
              className="h-auto w-full"
              priority
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              カードを準備しています
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="min-h-[48px] w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
      >
        結果を見る
      </button>
    </section>
  );
}
