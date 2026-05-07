const priorities = [
  'Review outstanding safeguarding escalations',
  'Address chronology gaps in May 2024',
  'Complete overdue actions before inspection',
  'Review police involvement patterns',
]

export function AISummaryPanel() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-panel backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          AI Operational Summary
        </h3>

        <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
          Live analysis
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
        <p>
          4 safeguarding escalations have been identified in the last 14 days.
        </p>

        <p>
          Chronology analysis indicates increased police involvement and unresolved actions may impact inspection readiness.
        </p>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Recommended priorities
        </div>

        <div className="mt-4 space-y-3">
          {priorities.map((priority, index) => (
            <div
              key={priority}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-medium text-violet-200">
                {index + 1}
              </div>

              <div className="text-sm leading-6 text-slate-300">
                {priority}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
