export function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="bg-glow-1 absolute -top-32 left-1/2 h-80 w-xl max-w-none -translate-x-1/2 rounded-full bg-linear-to-br from-blue-400/25 via-indigo-300/20 to-transparent blur-3xl" />
      <div className="bg-glow-2 absolute -bottom-20 -left-16 h-72 w-80 rounded-full bg-linear-to-tr from-violet-400/20 to-indigo-400/15 blur-3xl" />
      <div className="bg-glow-3 absolute bottom-10 right-0 h-64 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
    </div>
  );
}
