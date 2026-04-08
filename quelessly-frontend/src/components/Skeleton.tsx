export function SkeletonMenuCard() {
  return (
    <div className="bg-zinc-900 rounded-4xl overflow-hidden animate-pulse">
      <div className="h-32 bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-800/60 rounded-full w-1/3" />
        <div className="h-4 bg-zinc-800 rounded-full w-1/4 mt-3" />
      </div>
    </div>
  )
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-zinc-900 rounded-3xl p-5 animate-pulse space-y-4 border border-zinc-800">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-zinc-800 rounded-full w-32" />
          <div className="h-3 bg-zinc-800/60 rounded-full w-20" />
        </div>
        <div className="h-7 bg-zinc-800 rounded-full w-24" />
      </div>
      <div className="h-16 bg-zinc-800/50 rounded-xl" />
      <div className="h-12 bg-zinc-800 rounded-2xl" />
    </div>
  )
}
