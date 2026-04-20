import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="mx-auto w-full max-w-md text-center">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Locus
        </h1>
        <p className="mb-10 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          質問に答えて、自分の傾向を振り返りましょう。
        </p>
        <Link
          href="/survey"
          className="inline-flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-xl bg-zinc-900 px-6 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          はじめる
        </Link>
      </main>
    </div>
  );
}
