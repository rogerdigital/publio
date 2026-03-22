'use client';

export default function AiNewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1ea_100%)] px-4 py-10 text-[#3a3029] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#f1c3c3] bg-white p-8 shadow-[0_20px_60px_rgba(214,181,154,0.18)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d77443]">AI Daily Wire</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#241b16]">AI 新闻页暂时出了点问题</h1>
        <p className="mt-4 text-sm leading-7 text-[#6f6258]">
          我们已经拦住了这次异常，页面不会再直接白屏。你可以先重试一次；如果问题还在，错误信息也会保留下来方便继续排查。
        </p>
        <div className="mt-6 rounded-2xl border border-[#f1d7c7] bg-[#fff6ef] p-4 text-sm leading-7 text-[#7a6657]">
          {error.message || '未知客户端异常'}
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center rounded-full border border-[#efc6af] bg-[#ef6b38] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-105"
        >
          重新加载页面
        </button>
      </div>
    </div>
  );
}
