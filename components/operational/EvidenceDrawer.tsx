interface EvidenceItem {
  citation: string
  title: string
  excerpt: string
}

interface EvidenceDrawerProps {
  items: EvidenceItem[]
}

export function EvidenceDrawer({
  items,
}: EvidenceDrawerProps) {
  return (
    <aside className="border-l border-slate-800 bg-slate-950 p-4 overflow-auto">
      <h3 className="font-medium mb-4">Evidence & Citations</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.citation}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="text-xs text-slate-500 mb-1">
              {item.citation}
            </div>

            <div className="font-medium text-sm text-white">
              {item.title}
            </div>

            <div className="text-sm text-slate-300 mt-1 leading-6">
              {item.excerpt}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
