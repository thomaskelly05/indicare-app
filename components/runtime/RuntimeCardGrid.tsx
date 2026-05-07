import { RuntimeCard } from '@/lib/runtime-types'

interface RuntimeCardGridProps {
  cards: RuntimeCard[]
}

const priorityClassName: Record<RuntimeCard['priority'], string> = {
  normal: 'border-slate-800 bg-slate-950/90 text-slate-300',
  medium: 'border-sky-500/20 bg-sky-500/10 text-sky-100',
  high: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  critical: 'border-red-500/20 bg-red-500/10 text-red-100',
}

export function RuntimeCardGrid({ cards }: RuntimeCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <article
          key={`${card.card_type}-${card.title}`}
          className={`rounded-2xl border p-5 shadow-panel backdrop-blur ${priorityClassName[card.priority]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide opacity-70">
                {card.card_type.replaceAll('_', ' ')}
              </div>

              <h3 className="mt-2 text-lg font-semibold text-white">
                {card.title}
              </h3>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize">
              {card.priority}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6">
            {card.summary}
          </p>

          {card.actions.length > 0 ? (
            <div className="mt-5 space-y-2">
              <div className="text-xs uppercase tracking-wide opacity-60">
                Actions
              </div>

              {card.actions.slice(0, 3).map((action) => (
                <div
                  key={action}
                  className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm"
                >
                  {action}
                </div>
              ))}
            </div>
          ) : null}

          {card.citations.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {card.citations.map((citation) => (
                <span
                  key={citation}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
                >
                  [{citation}]
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
