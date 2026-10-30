interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
  accent?: string
}

export default function StatCard({ label, value, delta, deltaUp, accent }: StatCardProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden`}>
      {/* Barre d'accent */}
      {accent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
          style={{ backgroundColor: accent }}
        />
      )}
      <div className="text-[11px] text-gray-400 font-medium mb-2 leading-none">{label}</div>
      <div className="font-extrabold text-[26px] text-gray-900 tracking-tight leading-none">{value}</div>
      {delta && (
        <div className={`text-[11px] mt-2 font-medium flex items-center gap-1 ${deltaUp ? 'text-green-600' : 'text-red-500'}`}>
          {deltaUp
            ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
          {delta}
        </div>
      )}
    </div>
  )
}
