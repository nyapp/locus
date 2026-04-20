"use client";

import type { Question } from "@/lib/types";

type Props = {
  question: Question;
  questionLabelId: string;
};

export function QuestionPanel({ question, questionLabelId }: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-2" aria-hidden>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {question.category}
        </span>
        <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-zinc-700">
          {question.theory}
        </span>
        <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-500 ring-1 ring-zinc-100 dark:bg-zinc-900/40 dark:text-zinc-400 dark:ring-zinc-800">
          {question.dimension}
        </span>
      </div>
      <p
        id={questionLabelId}
        className="min-w-0 break-words text-lg font-medium leading-relaxed text-zinc-900 dark:text-zinc-50 sm:text-xl"
      >
        {question.question}
      </p>
    </div>
  );
}
