interface BadgeProps {
  variant: 'active' | 'pending' | 'suspended' | 'review' | 'enroute' | 'inprog' | 'done' | 'open' | 'urgent' | 'cancelled'
  label: string
}

const variants: Record<BadgeProps['variant'], string> = {
  active:    'bg-green-50 text-green-700',
  pending:   'bg-yellow-50 text-yellow-700',
  suspended: 'bg-red-50 text-red-700',
  review:    'bg-purple-50 text-purple-700',
  enroute:   'bg-purple-50 text-purple-700',
  inprog:    'bg-green-50 text-green-700',
  done:      'bg-green-50 text-green-700',
  open:      'bg-yellow-50 text-yellow-700',
  urgent:    'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const dots: Record<BadgeProps['variant'], string> = {
  active:    'bg-green-500',
  pending:   'bg-yellow-500',
  suspended: 'bg-red-500',
  review:    'bg-purple-500',
  enroute:   'bg-purple-500',
  inprog:    'bg-green-500',
  done:      'bg-green-500',
  open:      'bg-yellow-500',
  urgent:    'bg-red-500',
  cancelled: 'bg-gray-400',
}

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${variants[variant]}`}>
      <span className={`w-1 h-1 rounded-full ${dots[variant]}`}></span>
      {label}
    </span>
  )
}