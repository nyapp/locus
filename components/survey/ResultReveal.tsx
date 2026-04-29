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
  const [imageReady, setImageReady] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const archetypeImagePath = useMemo(() => {
    if (!report.archetypeKey) return null;
    return ARCHETYPE_IMAGE_PATH[report.archetypeKey];
  }, [report.archetypeKey]);

  useEffect(() => {
    setImageReady(archetypeImagePath === null);
  }, [archetypeImagePath]);

  useEffect(() => {
    setAnalysisDone(false);
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
    setIsAnimating(false);
    if (!analysisDone || !imageReady) return;
    if (prefersReducedMotion) {
      setIsAnimating(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [analysisDone, prefersReducedMotion, imageReady]);

  useEffect(() => {
    const delayMs = prefersReducedMotion ? 8700 : 9800;
    const timer = window.setTimeout(() => {
      setAnalysisDone(true);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [prefersReducedMotion, report.archetypeKey]);

  const cardMotionClass = prefersReducedMotion
    ? "opacity-100"
    : isAnimating
      ? "opacity-100 sm:translate-y-0 sm:scale-100"
      : "opacity-0 sm:translate-y-6 sm:scale-[0.96]";

  if (!analysisDone) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center justify-center px-4 py-10">
        <div
          className="flex w-full max-w-xs flex-col items-center justify-center rounded-2xl bg-transparent px-5 py-8"
          aria-live="polite"
          role="status"
        >
          <div className="relative flex h-11 w-11 items-center justify-center">
            <div
              className={[
                "h-9 w-9 rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100",
                prefersReducedMotion ? "" : "animate-spin",
              ].join(" ")}
            />
          </div>
          <p className="mt-5 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Now Loading
          </p>
          <p className="sr-only">回答データを多角的に解析しています。</p>
        </div>
      </section>
    );
  }

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
            "relative overflow-hidden rounded-2xl border border-zinc-200 bg-transparent shadow-lg transition-all duration-700 ease-out will-change-transform",
            "aspect-[337/512] dark:border-zinc-700 dark:bg-transparent",
            "[backface-visibility:hidden] [transform:translateZ(0)]",
            cardMotionClass,
          ].join(" ")}
        >
          {archetypeImagePath ? (
            <Image
              src={`${basePath}${archetypeImagePath}`}
              alt={`${report.archetypeLabelJa ?? "診断"}のカードイラスト`}
              fill
              sizes="(max-width: 640px) 70vw, 19rem"
              className="object-cover"
              onLoad={() => setImageReady(true)}
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
