"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LikertRow } from "@/components/survey/LikertRow";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { QuestionPanel } from "@/components/survey/QuestionPanel";
import { ResultReveal } from "@/components/survey/ResultReveal";
import { ScoreSummary } from "@/components/survey/ScoreSummary";
import { loadQuestions, loadScale } from "@/lib/parseQuestions";
import {
  clearScoreReport,
  loadScoreReport,
  persistScoreReport,
} from "@/lib/scoreReportStorage";
import {
  clearPersistedSurvey,
  loadPersistedSurvey,
  persistSurvey,
} from "@/lib/surveyStorage";
import {
  computeScoreReport,
  SCORE_REPORT_SCHEMA_VERSION,
} from "@/lib/scoring";
import type { ScoreReport } from "@/lib/scoring/types";
import type { AnswersMap, LikertValue, Question, ScaleOption } from "@/lib/types";
import {
  blocksSurveyDigitShortcuts,
  isInteractiveShortcutTarget,
} from "./keyboardGuards";

const QUESTION_LABEL_ID = "survey-question-text";
type ViewPhase = "answering" | "revealing" | "result";

export default function SurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scale, setScale] = useState<ScaleOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initDone, setInitDone] = useState(false);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [hint, setHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [scoreReport, setScoreReport] = useState<ScoreReport | null>(null);
  const [viewPhase, setViewPhase] = useState<ViewPhase>("answering");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [q, s] = await Promise.all([loadQuestions(), loadScale()]);
        if (cancelled) return;
        const storedReport = loadScoreReport();
        if (
          storedReport &&
          storedReport.schemaVersion === SCORE_REPORT_SCHEMA_VERSION
        ) {
          setQuestions(q);
          setScale(s);
          setScoreReport(storedReport);
          setCompleted(true);
          setViewPhase("result");
          setLoadError(null);
          setInitDone(true);
          return;
        }
        const saved = loadPersistedSurvey();
        setQuestions(q);
        setScale(s);
        if (saved && q.length > 0) {
          setAnswers(saved.answers);
          setIndex(Math.min(saved.index, Math.max(0, q.length - 1)));
        }
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました");
      } finally {
        if (!cancelled) setInitDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initDone || questions.length === 0 || loadError || completed) return;
    persistSurvey(answers, index);
  }, [answers, index, initDone, questions.length, loadError, completed]);

  const total = questions.length;
  const current = questions[index];
  const currentAnswer = current ? answers[current.id] : undefined;

  const progressCurrent = useMemo(() => {
    if (total === 0) return 0;
    let answered = 0;
    for (const q of questions) {
      if (answers[q.id] !== undefined) answered += 1;
    }
    return answered;
  }, [questions, answers, total]);

  const setAnswer = useCallback((id: number, v: LikertValue) => {
    setAnswers((prev) => ({ ...prev, [id]: v }));
    setHint(null);
  }, []);

  useEffect(() => {
    if (!current || completed || scale.length === 0) return;

    const allowedValues = new Set(scale.map((option) => option.value.toString()));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (blocksSurveyDigitShortcuts(event.target)) return;

      if (!allowedValues.has(event.key)) return;
      setAnswer(current.id, Number(event.key) as LikertValue);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [current, completed, scale, setAnswer]);

  const goNext = useCallback(() => {
    if (!current) return;
    if (currentAnswer === undefined) {
      setHint("選択肢を1つ選んでから次へ進んでください。");
      return;
    }
    setHint(null);
    if (index < total - 1) {
      setIndex((i) => i + 1);
    }
  }, [current, currentAnswer, index, total]);

  const goPrev = useCallback(() => {
    setHint(null);
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  const finish = useCallback(() => {
    if (!current || questions.length === 0) return;
    if (currentAnswer === undefined) {
      setHint("選択肢を1つ選んでから完了できます。");
      return;
    }
    const report = computeScoreReport(questions, answers);
    persistScoreReport(report);
    clearPersistedSurvey();
    setScoreReport(report);
    setCompleted(true);
    setViewPhase("revealing");
  }, [current, currentAnswer, questions, answers]);

  useEffect(() => {
    if (!current || completed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "Enter") return;

      if (isInteractiveShortcutTarget(event.target)) return;

      event.preventDefault();
      if (index === total - 1) {
        finish();
        return;
      }
      goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [current, completed, index, total, finish, goNext]);

  const handleRetry = useCallback(() => {
    clearScoreReport();
    clearPersistedSurvey();
    setScoreReport(null);
    setCompleted(false);
    setAnswers({});
    setIndex(0);
    setHint(null);
    setViewPhase("answering");
  }, []);

  if (loadError) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
        <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
          {loadError}
        </p>
        <Link
          href="/"
          className="text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
        >
          トップへ戻る
        </Link>
      </div>
    );
  }

  if (!initDone || questions.length === 0 || scale.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-24">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100"
          aria-hidden
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中…</p>
      </div>
    );
  }

  if (viewPhase === "revealing" && scoreReport) {
    return (
      <ResultReveal
        report={scoreReport}
        onSkip={() => setViewPhase("result")}
      />
    );
  }

  if (viewPhase === "result" && scoreReport) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <ScoreSummary report={scoreReport} onRetry={handleRetry} />
        <div className="mx-auto w-full max-w-lg px-4 pb-10 print:hidden">
          <Link
            href="/"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            トップへ
          </Link>
        </div>
      </div>
    );
  }

  if ((viewPhase === "revealing" || viewPhase === "result") && !scoreReport) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          結果を読み込めませんでした。もう一度回答してください。
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-[48px] rounded-xl bg-zinc-900 px-4 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          はじめから
        </button>
      </div>
    );
  }

  const isLast = index === total - 1;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-1 min-h-full flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6 shrink-0">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            質問に回答
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            閉じる
          </Link>
        </div>
        <ProgressBar current={progressCurrent} total={total} />
      </header>

      <main className="flex w-full min-w-0 min-h-0 flex-1 flex-col gap-6">
        {current && (
          <>
            <QuestionPanel
              question={current}
              questionLabelId={QUESTION_LABEL_ID}
            />
            <LikertRow
              options={scale}
              value={currentAnswer}
              onChange={(v) => setAnswer(current.id, v)}
              name={`q-${current.id}`}
              labelledBy={QUESTION_LABEL_ID}
            />
            {hint && (
              <p
                className="text-sm text-amber-800 dark:text-amber-200"
                role="status"
              >
                {hint}
              </p>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto flex shrink-0 gap-3 pt-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="min-h-[48px] min-w-[96px] flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        >
          前へ
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={goNext}
            className="min-h-[48px] flex-[2] rounded-xl bg-zinc-900 px-4 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            次へ
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="min-h-[48px] flex-[2] rounded-xl bg-zinc-900 px-4 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            完了
          </button>
        )}
      </footer>
    </div>
  );
}
