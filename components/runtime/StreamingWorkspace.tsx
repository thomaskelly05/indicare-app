import { RuntimeWorkspacePayload } from '@/lib/runtime-types'

interface StreamingWorkspaceProps {
  payload: RuntimeWorkspacePayload
}

export function StreamingWorkspace({
  payload,
}: StreamingWorkspaceProps) {
  return (
    <div className="space-y-4">
      {(payload.chunks ?? []).map((chunk) => (
        <div
          key={`${chunk.chunk_type}-${chunk.sequence}`}
          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
        >
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            {chunk.chunk_type}
          </div>

          <pre className="overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">
            {JSON.stringify(chunk.payload, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}
