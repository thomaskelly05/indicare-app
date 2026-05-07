interface ChronologyEvent {
  id: string
  date: string
  title: string
  summary: string
  safeguarding?: boolean
}

interface ChronologyTimelineProps {
  events: ChronologyEvent[]
}

export function ChronologyTimeline({
  events,
}: ChronologyTimelineProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-white">
          Chronology Timeline
        </h3>

        <span className="text-xs text-slate-400">
          {events.length} events
        </span>
      </div>

      <div className="space-y-5 border-l border-slate-700 pl-4">
        {events.map((event) => (
          <div key={event.id}>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-slate-500">
                {event.date}
              </div>

              {event.safeguarding ? (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                  Safeguarding
                </span>
              ) : null}
            </div>

            <div className="font-medium text-white">
              {event.title}
            </div>

            <div className="text-sm text-slate-300 mt-1 leading-6">
              {event.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
