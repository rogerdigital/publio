'use client';

export default function AiNewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--wb-bg)] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--wb-accent)]">AI Daily Wire</p>
        <h1 className="mt-4 text-3xl font-semibold text-[color:var(--wb-text)]">AI 新闻页暂时出了点问题</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--wb-text-muted)]">
          我们已经拦住了这次异常，页面不会再直接白屏。你可以先重试一次；如果问题还在，错误信息也会保留下来方便继续排查。
        </p>
        <div className="mt-6 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-error-border)] bg-[color:var(--wb-error-bg)] p-4 text-sm leading-7 text-[color:var(--wb-error-text)]">
          {error.message || '未知客户端异常'}
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center rounded-[var(--wb-radius-lg)] border border-transparent bg-[color:var(--wb-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-105"
        >
          重新加载页面
        </button>
      </div>
    </div>
  );
}
