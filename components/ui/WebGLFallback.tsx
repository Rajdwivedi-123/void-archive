export function WebGLFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#030303] px-6 text-center text-white">
      <div className="max-w-md border-l border-white/20 py-5 pl-7 text-left">
        <p className="text-[10px] uppercase tracking-[0.55em] text-white/45">VOID ARCHIVE</p>
        <h2 className="mt-5 text-xl font-medium tracking-[0.2em] sm:text-2xl">WEBGL EXPERIENCE UNAVAILABLE</h2>
        <p className="mt-4 text-xs leading-6 tracking-[0.12em] text-white/48">
          This archive requires hardware-accelerated WebGL. Enable graphics acceleration or use a compatible browser to continue.
        </p>
      </div>
    </div>
  );
}
