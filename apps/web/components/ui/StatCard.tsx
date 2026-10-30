interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  delta?: number
  accent?: string
  icon?: React.ReactNode
}

export default function StatCard({ label, value, sub, delta, accent, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4 items-start relative overflow-hidden">
      {accent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: accent }}
        />
      )}
      {icon && (
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[11.5px] font-semibold text-gray-400 mb-1 truncate">{label}</div>
        <div className="text-[26px] font-extrabold text-[#0a2535] leading-none">{value}</div>
        <div className="flex items-center gap-2 mt-1.5">
          {delta !== undefined && (
            <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {delta >= 0 ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1.5v7M2 4.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 8.5v-7M2 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {Math.abs(delta)}%
            </div>
          )}
          {sub && <div className="text-[11px] text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  )
}
