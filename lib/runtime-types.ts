export type RuntimePriority = 'normal' | 'medium' | 'high' | 'critical'

export interface RuntimeCitation {
  citation_ref: string
  title: string
  record_type: string
  excerpt: string
  chronology_position?: string
}

export interface RuntimeCard {
  card_type: string
  title: string
  priority: RuntimePriority
  summary: string
  citations: string[]
  actions: string[]
  metadata?: Record<string, unknown>
}

export interface RuntimeChunk {
  chunk_type: 'retrieval' | 'card' | 'citations' | 'text' | 'alert'
  sequence: number
  payload: Record<string, unknown>
}

export interface RuntimeWorkspacePayload {
  workspace_type: string
  cards: RuntimeCard[]
  citation_drawer: RuntimeCitation[]
  chunks?: RuntimeChunk[]
  warnings: string[]
}
