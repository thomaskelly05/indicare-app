import { STANDALONE_SURFACE } from '@/lib/runtime-surfaces'

export default function StandaloneAssistantPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Standalone Assistant
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Independent AI assistant with isolated runtime, isolated memory and no operational retrieval crossover.
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Runtime surface
          </div>

          <div className="mt-3 text-sm text-slate-300 leading-6">
            Surface: {STANDALONE_SURFACE.surface}
          </div>

          <div className="mt-2 text-sm text-slate-300 leading-6">
            Persistent operational memory: disabled
          </div>

          <div className="mt-2 text-sm text-slate-300 leading-6">
            Chronology runtime: disabled
          </div>
        </div>

        <div className="mt-6 flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
              Hello — how can I help today?
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-400">
              This assistant is isolated from IndiCare OS operational runtime and chronology systems.
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <input
            className="focus-ring flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            placeholder="Message standalone assistant..."
          />

          <button
            className="focus-ring rounded-xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            type="button"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
