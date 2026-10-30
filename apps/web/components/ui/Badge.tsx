type BadgeVariant =
  | 'amber'
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'green'
  | 'red'
  | 'gray'
  | 'teal'

const VARIANTS: Record<BadgeVariant, string> = {
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  violet:  'bg-violet-50 text-violet-700 border-violet-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  green:   'bg-green-50 text-green-700 border-green-200',
  red:     'bg-red-50 text-red-700 border-red-200',
  gray:    'bg-gray-50 text-gray-600 border-gray-200',
  teal:    'bg-[#f0f7f5] text-[#0d5068] border-[#d1e8e2]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
}

export default function Badge({ children, variant = 'gray', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${VARIANTS[variant]}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'currentColor', opacity: 0.7 }} />
      )}
      {children}
    </span>
  )
}
