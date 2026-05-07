import { OPERATIONAL_OS_SURFACE, STANDALONE_SURFACE } from '@/lib/runtime-surfaces'

interface AssistantSurfaceSwitcherProps {
  activeSurface: 'standalone' | 'operational_os'
}

export function AssistantSurfaceSwitcher({
  activeSurface,
}: AssistantSurfaceSwitcherProps) {
  const surfaces = [
    {
      key: STANDALONE_SURFACE.surface,
      label: 'Standalone Assistant',
      description: 'ChatGPT-style support with no OS evidence retrieval.',
    },
    {
      key: OPERATIONAL_OS_SURFACE.surface,
      label: 'IndiCare OS',
      description: 'Operational Copilot with chronology, evidence and workflows.',
    },
  ] as const

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
        Assistant surface
      </div>

      <div className="grid gap-2">
        {surfaces.map((surface) => {
          const active = surface.key === activeSurface

          return (
            <button
              key={surface.key}
              className={`focus-ring rounded-xl border p-3 text-left transition ${
                active
                  ? 'border-sky-400/40 bg-sky-400/10'
                  : 'border-slate-800 bg-slate-900 hover:bg-slate-800'
              }`}
              type="button"
            >
              <div className="text-sm font-medium text-white">
                {surface.label}
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-400">
                {surface.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
