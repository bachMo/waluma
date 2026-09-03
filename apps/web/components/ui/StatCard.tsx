interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
}

export default function StatCard({ label, value, delta, deltaUp }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs text-gray-400 font-medium mb-1.5">{label}</div>
      <div className="font-extrabold text-2xl text-gray-900 tracking-tight leading-none">{value}</div>
      {delta && (
        <div className={`text-xs mt-1.5 font-medium ${deltaUp ? 'text-green-600' : 'text-red-500'}`}>
          {deltaUp ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  )
}