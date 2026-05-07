import { RuntimeWorkspacePayload } from '@/lib/runtime-types'

export const operationalWorkspacePayload: RuntimeWorkspacePayload = {
  workspace_type: 'operational_overview',
  warnings: [
    'Repeated missing-from-care indicators detected.',
    'Inspection evidence gaps identified.',
  ],
  cards: [
    {
      card_type: 'safeguarding_alert',
      title: 'Repeated Missing Episodes',
      priority: 'critical',
      summary:
        '3 missing-from-care incidents recorded in the last 14 days.',
      citations: ['incident:1', 'incident:2'],
      actions: ['Review chronology', 'Escalate safeguarding review'],
    },
    {
      card_type: 'inspection_risk',
      title: 'Inspection Readiness Risk',
      priority: 'high',
      summary:
        'Management oversight records incomplete for Home 2.',
      citations: ['qa:1'],
      actions: ['Review oversight records'],
    },
  ],
  citation_drawer: [
    {
      citation_ref: 'incident:1',
      title: 'Police involvement report',
      record_type: 'incident',
      excerpt:
        'Police attended after child was missing overnight.',
    },
    {
      citation_ref: 'qa:1',
      title: 'Quality assurance review',
      record_type: 'governance',
      excerpt:
        'Monthly oversight records incomplete for April.',
    },
  ],
  chunks: [
    {
      chunk_type: 'alert',
      sequence: 1,
      payload: {
        level: 'critical',
        message:
          'Repeated missing-from-care indicators detected.',
      },
    },
    {
      chunk_type: 'card',
      sequence: 2,
      payload: {
        title: 'Inspection Risk',
        priority: 'high',
      },
    },
  ],
}
