export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  )
}