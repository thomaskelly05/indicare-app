export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="grid grid-cols-[260px_1fr_360px] min-h-screen">
        <aside className="border-r border-slate-800 p-4 bg-slate-950">
          <h1 className="text-xl font-semibold mb-6">IndiCare OS</h1>

          <div className="space-y-2">
            <button className="w-full rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700">
              Assistant
            </button>
            <button className="w-full rounded-lg bg-slate-900 p-3 text-left hover:bg-slate-800">
              Chronology
            </button>
            <button className="w-full rounded-lg bg-slate-900 p-3 text-left hover:bg-slate-800">
              Safeguarding
            </button>
            <button className="w-full rounded-lg bg-slate-900 p-3 text-left hover:bg-slate-800">
              Inspection
            </button>
            <button className="w-full rounded-lg bg-slate-900 p-3 text-left hover:bg-slate-800">
              Provider
            </button>
          </div>
        </aside>

        <section className="flex flex-col">
          <header className="border-b border-slate-800 px-6 py-4 bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Operational Copilot Workspace</h2>
                <p className="text-sm text-slate-400">
                  Live chronology, safeguarding and operational intelligence.
                </p>
              </div>

              <div className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300 border border-red-500/20">
                2 safeguarding alerts
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-900">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-medium mb-2">Operational Attention</h3>
              <p className="text-slate-300 text-sm">
                Repeated missing-from-care indicators detected over the last 7 days with unresolved follow-up actions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-medium mb-4">Chronology Timeline</h3>

              <div className="space-y-4 border-l border-slate-700 pl-4">
                <div>
                  <div className="text-xs text-slate-500">12 Mar 2026 • 14:03</div>
                  <div className="font-medium">Missing-from-care episode</div>
                  <div className="text-sm text-slate-300">
                    Police informed following missing episode. Return-home interview recommended.
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">13 Mar 2026 • 09:20</div>
                  <div className="font-medium">Strategy discussion</div>
                  <div className="text-sm text-slate-300">
                    Multi-agency safeguarding concerns discussed with escalation indicators identified.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-800 bg-slate-950 p-4">
          <h3 className="font-medium mb-4">Evidence & Citations</h3>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="text-xs text-slate-500 mb-1">[incident:1]</div>
              <div className="font-medium text-sm">Missing-from-care incident</div>
              <div className="text-sm text-slate-300 mt-1">
                Police informed after young person failed to return.
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="text-xs text-slate-500 mb-1">[meeting:2]</div>
              <div className="font-medium text-sm">Strategy meeting</div>
              <div className="text-sm text-slate-300 mt-1">
                Escalation concerns discussed with safeguarding agencies.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
