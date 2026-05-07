interface OperationalCardProps {
  title: string
  description: string
  priority?: 'normal' | 'high'
}

export function OperationalCard({
  title,
  description,
  priority = 'normal',
}: OperationalCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 bg-slate-950 ${
        priority === 'high'
          ? 'border-red-500/30'
          : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white">{title}</h3>

        {priority === 'high' ? (
          <span className="text-xs rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300">
            High priority
          </span>
        ) : null}
      </div>

      <p className="text-sm text-slate-300 leading-6">
        {description}
      </p>
    </div>
  )
}
