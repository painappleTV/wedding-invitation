/**
 * 透過度高めの動く背景（全ページ共通）
 */
export function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* ベースグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-white" />
      {/* 浮遊する光の粒（透過度高め・動きが見やすいようやや濃く） */}
      <div className="absolute inset-0">
        <div className="bg-amber-200/25 rounded-full blur-2xl w-[400px] h-[400px] animate-float-1 -left-32 top-1/4" />
        <div className="bg-amber-300/20 rounded-full blur-2xl w-[350px] h-[350px] animate-float-2 right-0 top-1/3" />
        <div className="bg-amber-400/22 rounded-full blur-2xl w-[300px] h-[300px] animate-float-3 left-1/4 bottom-1/4" />
        <div className="bg-amber-200/20 rounded-full blur-2xl w-[380px] h-[380px] animate-float-4 right-1/4 top-1/2" />
      </div>
    </div>
  );
}
