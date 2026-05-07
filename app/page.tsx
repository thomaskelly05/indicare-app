import { AISummaryPanel } from '@/components/dashboard/AISummaryPanel'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChronologyTimeline } from '@/components/chronology/ChronologyTimeline'
import { AssistantSurfaceSwitcher } from '@/components/layout/AssistantSurfaceSwitcher'
import { EvidenceDrawer } from '@/components/operational/EvidenceDrawer'

const chronologyEvents = [
  {
    id: '1',
    date: '21 May 2024 • 14:30',
    title: 'Police involvement at Home 1',
    summary:
      'Police attended following missing episode. Child returned home safely.',
    safeguarding: true,
  },
  {
    id: '2',
    date: '20 May 2024 • 19:15',
    title: 'Return from respite',
    summary:
      'Child returned from planned respite placement.',
  },
  {
    id: '3',
    date: '18 May 2024 • 11:00',
    title: 'Allegation reported by staff',
    summary:
      'Allegation of inappropriate language by staff member.',
    safeguarding: true,
  },
]

const evidenceItems = [
  {
    citation: '[incident:1]',
    title: 'Police involvement report',
    excerpt:
      'Police attended following report of child missing from the home.',
  },
  {
    citation: '[staff:4]',
    title: 'Missing episode report',
    excerpt:
      'Child left the home without permission at approximately 21:00.',
  },
  {
    citation: '[case:2]',
    title: 'Return from respite',
    excerpt:
      'Child returned from respite placement with no concerns raised.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-radial-dashboard bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-[260px_1fr_360px]">
        <aside className="flex flex-col border-r border-slate-800 bg-slate-950/90 p-5 backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              IndiCare OS
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Operational Copilot for residential children's homes.
            </p>
          </div>

          <div className="mt-6">
            <AssistantSurfaceSwitcher activeSurface="operational_os" />
          </div>

          <div className="mt-6 space-y-2">
            {[
              'Assistant',
              'Chronology',
              'Safeguarding',
              'Inspection',
              'Provider Intelligence',
              'Homes',
              'Children',
              'Reports',
            ].map((item) => (
              <button
                key={item}
                className="focus-ring flex w-full items-center rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Active workflow
            </div>

            <div className="mt-3 text-lg font-semibold text-white">
              Safeguarding Review
            </div>

            <div className="mt-2 text-sm text-slate-400">
              Home 1 • Child C1
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-2/3 rounded-full bg-violet-500" />
            </div>
          </div>
        </aside>

        <section className="flex flex-col overflow-hidden">
          <header className="border-b border-slate-800 bg-slate-950/70 px-8 py-5 backdrop-blur">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  Operational Copilot
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Good morning, Thomas
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Here's your operational overview and priority intelligence.
                </p>
              </div>

              <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-500">
                Search homes, chronology, safeguarding, actions...
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto px-8 py-6">
            <div className="grid grid-cols-4 gap-4">
              <KpiCard
                title="High Priority Alerts"
                value="6"
                subtitle="Require immediate attention"
                accent="red"
              />

              <KpiCard
                title="Chronology Gaps"
                value="3"
                subtitle="Need review"
                accent="amber"
              />

              <KpiCard
                title="Unresolved Actions"
                value="12"
                subtitle="Across 4 homes"
                accent="violet"
              />

              <KpiCard
                title="Inspection Risk"
                value="High"
                subtitle="2 upcoming inspections"
                accent="blue"
              />
            </div>

            <div className="mt-6 grid grid-cols-[1.3fr_0.7fr] gap-6">
              <ChronologyTimeline events={chronologyEvents} />

              <AISummaryPanel />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-panel backdrop-blur">
              <div className="text-sm text-slate-400">
                Ask anything about children, homes, safeguarding, inspections or chronology...
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Attach evidence
                </button>

                <button className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Summarise chronology
                </button>

                <button className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Create action
                </button>

                <div className="ml-auto rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white">
                  Send
                </div>
              </div>
            </div>
          </div>
        </section>

        <EvidenceDrawer items={evidenceItems} />
      </div>
    </main>
  )
}
