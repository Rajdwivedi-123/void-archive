"use client";

export default function ErrorBoundary({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030303] px-6 text-center text-white">
      <div className="max-w-md border-l border-white/20 py-5 pl-7 text-left">
        <p className="text-[10px] uppercase tracking-[0.55em] text-white/45">VOID ARCHIVE</p>
        <h1 className="mt-5 text-2xl font-medium tracking-[0.22em]">ARCHIVE SIGNAL INTERRUPTED</h1>
        <p className="mt-4 text-xs leading-6 tracking-[0.12em] text-white/48">
          The observation system could not complete this frame. The archive record remains intact.
        </p>
        <button
          className="mt-7 border border-white/20 px-5 py-3 text-[10px] tracking-[0.3em] text-white/75 transition-colors hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          onClick={() => unstable_retry()}
          type="button"
        >
          RESTORE SIGNAL
        </button>
      </div>
    </main>
  );
}
