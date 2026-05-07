interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  accent?: 'red' | 'amber' | 'violet' | 'blue'
}

const accentClasses = {
  red: 'border-red-500/20 bg-red-500/10 text-red-200',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  violet: 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  blue: 'border-sky-500/20 bg-sky-500/10 text-sky-200',
}

export function KpiCard({
  title,
  value,
  subtitle,
  accent = 'blue',
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">
            {title}
          </div>

          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {value}
          </div>

          <div className="mt-2 text-sm text-slate-500">
            {subtitle}
          </div>
        </div>

        <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${accentClasses[accent]}`}>
          Live
        </div>
      </div>
    </div>
  )
}
