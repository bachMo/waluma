interface BadgeProps {
  variant: 'active' | 'pending' | 'suspended' | 'review' | 'enroute' | 'inprog' | 'done' | 'open' | 'urgent' | 'cancelled'
  label: string
}

const config: Record<BadgeProps['variant'], { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-green-50',    text: 'text-green-700',  dot: 'bg-green-500' },
  pending:   { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
  suspended: { bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500' },
  review:    { bg: 'bg-violet-50',   text: 'text-violet-700', dot: 'bg-violet-500' },
  enroute:   { bg: 'bg-blue-50',     text: 'text-blue-700',   dot: 'bg-blue-500' },
  inprog:    { bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-500' },
  done:      { bg: 'bg-green-50',    text: 'text-green-700',  dot: 'bg-green-500' },
  open:      { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
  urgent:    { bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-100',    text: 'text-gray-500',   dot: 'bg-gray-400' },
}

export default function Badge({ variant, label }: BadgeProps) {
  const { bg, text, dot } = config[variant]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  )
}
