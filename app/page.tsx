import { ChronologyTimeline } from '@/components/chronology/ChronologyTimeline'
import { AssistantSurfaceSwitcher } from '@/components/layout/AssistantSurfaceSwitcher'
import { EvidenceDrawer } from '@/components/operational/EvidenceDrawer'
import { OperationalCard } from '@/components/operational/OperationalCard'

const chronologyEvents = [
  {
    id: '1',
    date: '12 Mar 2026 • 14:03',
    title: 'Missing-from-care episode',
    summary:
      'Police informed following missing episode. Return-home interview recommended.',
    safeguarding: true,
  },
  {
    id: '2',
    date: '13 Mar 2026 • 09:20',
    title: 'Strategy discussion',
    summary:
      'Multi-agency safeguarding concerns discussed with escalation indicators identified.',
    safeguarding: true,
  },
]

const evidenceItems = [
  {
    citation: '[incident:1]',
    title: 'Missing-from-care incident',
    excerpt:
      'Police informed after young person failed to return.',
  },
  {
    citation: '[meeting:2]',
    title: 'Strategy meeting',
    excerpt:
      'Escalation concerns discussed with safeguarding agencies.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-[280px_1fr_360px]">
        <aside className="border-r border-slate-800 bg-slate-950 p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              IndiCare OS
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Operational Copilot for residential children's homes.
            </p>
          </div>

          <AssistantSurfaceSwitcher
            activeSurface="operational_os"
          />

          <div className="mt-6 space-y-2">
            {[
              'Assistant',
              'Chronology',
              'Safeguarding',
              'Inspection',
              'Provider',
            ].map((item) => (
              <button
                key={item}
                className="focus-ring w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col bg-slate-900">
          <header className="border-b border-slate-800 bg-slate-950 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Operational Workspace
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Chronology-aware safeguarding and operational intelligence.
                </p>
              </div>

              <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                2 safeguarding alerts
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-auto p-6">
            <OperationalCard
              title="Operational Attention"
              description="Repeated missing-from-care indicators detected over the last 7 days with unresolved follow-up actions."
              priority="high"
            />

            <ChronologyTimeline
              events={chronologyEvents}
            />
          </div>
        </section>

        <EvidenceDrawer items={evidenceItems} />
      </div>
    </main>
  )
}
