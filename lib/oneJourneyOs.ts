export type OsCard = {
  id: string;
  title: string;
  summary: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'normal' | string;
  route?: string;
  source?: string;
  count?: number;
  metadata?: Record<string, unknown>;
};

export type OsChild = {
  id: string;
  name: string;
  preferredName?: string;
  age?: number | null;
  home?: string | null;
  riskLevel?: string | null;
  status?: string | null;
  currentState?: string | null;
  route: string;
  raw?: Record<string, unknown>;
};

export type OneJourneyOsState = {
  adult?: Record<string, unknown> | null;
  home?: Record<string, unknown> | null;
  provider?: Record<string, unknown> | null;
  children: OsChild[];
  selectedChild?: OsChild | null;
  notifications: OsCard[];
  connect: OsCard[];
  today: OsCard[];
  manager: OsCard[];
  inspection: OsCard[];
  apps: OsCard[];
  health: OsCard[];
  schema: OsCard[];
  sourceMap?: Record<string, unknown>;
  generatedAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_INDICARE_API_BASE || '';

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return fallback;
    const payload = await response.json().catch(() => fallback as unknown);
    if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
      return ((payload as { data?: T }).data || fallback) as T;
    }
    return payload as T;
  } catch {
    return fallback;
  }
}

function asArray(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function text(value: unknown, fallback = '') {
  return String(value ?? '').trim() || fallback;
}

function normaliseChildren(data: any): OsChild[] {
  return asArray(data, ['young_people', 'children', 'items', 'data']).map((child: any, index: number) => {
    const id = text(child.young_person_id || child.id, String(index + 1));
    return {
      id,
      name: text(child.display_name || child.name || child.full_name, 'Young person'),
      preferredName: text(child.preferred_name || child.first_name, ''),
      age: child.age ? Number(child.age) : null,
      home: text(child.home_name || child.home, ''),
      riskLevel: text(child.summary_risk_level || child.risk_level || child.os_state, ''),
      status: text(child.placement_status || child.status, 'Active'),
      currentState: text(child.current_state || child.presentation || child.summary, ''),
      route: `/young-people/${encodeURIComponent(id)}/workspace`,
      raw: child,
    };
  });
}

function notificationCards(feed: any): OsCard[] {
  return asArray(feed, ['items', 'notifications', 'data']).slice(0, 12).map((item: any, index: number) => ({
    id: text(item.notification_key || item.id, `notification-${index}`),
    title: text(item.title, 'Notification'),
    summary: text(item.safe_summary || item.summary, 'Operational notification'),
    status: text(item.status, item.unread ? 'unread' : 'read'),
    priority: text(item.severity, 'medium'),
    route: text(item.route, '/notifications'),
    source: text(item.source || item.category, 'notifications'),
    metadata: item.metadata || {},
  }));
}

function connectCards(meToday: any, unread: any): OsCard[] {
  const cards: OsCard[] = [];
  const count = Number(unread?.count || meToday?.connect?.count || 0);
  cards.push({
    id: 'connect-unread',
    title: 'Connect messages',
    summary: count ? `${count} unread Connect item(s) need attention.` : 'No unread Connect messages in scope.',
    status: count ? 'unread' : 'clear',
    priority: count ? 'medium' : 'normal',
    count,
    route: '/connect',
    source: 'connect',
  });
  for (const thread of asArray(unread, ['threads', 'items']).slice(0, 5)) {
    cards.push({
      id: text(thread.id || thread.thread_id, `connect-${cards.length}`),
      title: text(thread.title || thread.name, 'Connect thread'),
      summary: text(thread.last_message || thread.summary, 'Open Connect thread'),
      status: 'thread',
      priority: 'normal',
      route: `/connect/${thread.id || thread.thread_id || ''}`,
      source: 'connect',
    });
  }
  return cards;
}

function meTodayCards(meToday: any): OsCard[] {
  const cards: OsCard[] = [];
  const handover = meToday?.handover || {};
  const handoverSummary = handover?.summary || {};
  cards.push({
    id: 'today-handover',
    title: 'Today handover',
    summary: `${Number(handoverSummary.total || 0)} handover item(s), ${Number(handoverSummary.urgent || 0)} urgent, ${Number(handoverSummary.unacknowledged || 0)} unacknowledged.`,
    status: Number(handoverSummary.urgent || 0) ? 'urgent' : 'open',
    priority: Number(handoverSummary.urgent || 0) ? 'high' : 'normal',
    route: '/handover',
    source: 'me_today',
  });
  for (const item of asArray(handover, ['items']).slice(0, 6)) {
    cards.push({
      id: text(item.id, `handover-${cards.length}`),
      title: text(item.title, 'Handover item'),
      summary: text(item.summary || item.description, 'Handover update'),
      status: text(item.status, 'open'),
      priority: text(item.priority || item.severity, 'medium'),
      route: '/handover',
      source: 'handover',
    });
  }
  return cards;
}

function managerBriefCards(brief: any): OsCard[] {
  const data = brief?.data || brief;
  const items = [
    ...asArray(data, ['priorities']),
    ...asArray(data, ['risks']),
    ...asArray(data, ['actions']),
    ...asArray(data, ['sections']),
  ];
  if (!items.length) {
    return [{ id: 'manager-brief', title: 'Manager daily brief', summary: text(data?.summary, 'Daily brief is available for managers and seniors.'), status: data ? 'available' : 'not-loaded', priority: 'medium', route: '/command-centre/briefing', source: 'manager_daily_brief' }];
  }
  return items.slice(0, 10).map((item: any, index: number) => ({
    id: text(item.id, `manager-${index}`),
    title: text(item.title || item.label, 'Manager priority'),
    summary: text(item.summary || item.description || item.reason, 'Manager operating item'),
    status: text(item.status || item.severity, 'open'),
    priority: text(item.priority || item.severity, 'medium'),
    route: text(item.route, '/command-centre/briefing'),
    source: 'manager_daily_brief',
  }));
}

function inspectionCards(inspection: any): OsCard[] {
  const data = inspection?.data || inspection;
  const items = [
    ...asArray(data, ['evidence_gaps', 'gaps', 'items']),
    ...asArray(data, ['risks', 'risk_items']),
    ...asArray(data, ['sections']),
  ];
  if (!items.length) {
    return [{ id: 'inspection-readiness', title: 'Inspection readiness', summary: text(data?.summary, 'Inspection dashboard, packs and evidence readiness are connected.'), status: data ? 'available' : 'not-loaded', priority: 'medium', route: '/inspection-readiness', source: 'inspection_readiness' }];
  }
  return items.slice(0, 12).map((item: any, index: number) => ({
    id: text(item.id, `inspection-${index}`),
    title: text(item.title || item.label || item.area, 'Inspection evidence'),
    summary: text(item.summary || item.description || item.reason, 'Inspection readiness item'),
    status: text(item.status || item.risk, 'review'),
    priority: text(item.priority || item.risk, 'medium'),
    route: '/inspection-readiness',
    source: 'inspection_readiness',
  }));
}

function sourceMapApps(sourceMap: any): OsCard[] {
  const sources = sourceMap?.sources || {};
  const priority = [
    'profile', 'adult_today', 'connect', 'notifications', 'orb', 'documents', 'plans', 'risk', 'daily_notes', 'incidents', 'missing_episodes', 'safeguarding',
    'keywork', 'health', 'education', 'family', 'appointments', 'handover', 'calendar', 'reports', 'compliance',
    'standards', 'chronology', 'journey', 'recording_reviews', 'manager_operating_system', 'inspection_governance',
    'audits_and_validation'
  ];
  return priority.filter((key) => sources[key]).map((key) => {
    const routes = sources[key] as Record<string, unknown>;
    const routeValues = Object.values(routes || {}).filter((value) => typeof value === 'string') as string[];
    return { id: `app-${key}`, title: key.replaceAll('_', ' '), summary: `${routeValues.length} existing route(s) connected to this OS surface.`, status: 'connected', priority: 'normal', route: routeValues.find((value) => value.startsWith('/')) || '/', source: 'source_map', metadata: { routes } };
  });
}

function schemaCards(schema: any): OsCard[] {
  const entries = Object.entries(schema || {});
  const missing = entries.filter(([, ok]) => !ok);
  const ready = entries.filter(([, ok]) => Boolean(ok));
  const groups = [
    ['core_child_workspace', ['vw_os_young_person_profile', 'vw_os_young_person_timeline', 'vw_os_young_person_care_record_feed', 'os_command_items']],
    ['recording_tables', ['daily_notes', 'incidents', 'missing_episodes', 'safeguarding_records', 'keywork_sessions', 'health_records', 'education_records', 'family_contact_records']],
    ['journey_and_voice', ['child_voice_entries', 'life_story_entries', 'handover_records', 'chronology_events']],
    ['management_and_review', ['manager_review_queue', 'vw_os_care_plan_review_board', 'os_command_live_feed']],
  ];
  const cards = groups.map(([group, names]) => {
    const groupNames = names as string[];
    const groupMissing = groupNames.filter((name) => schema?.[name] === false);
    return { id: `schema-${group}`, title: group.replaceAll('_', ' '), summary: groupMissing.length ? `${groupMissing.length} missing: ${groupMissing.join(', ')}` : `${groupNames.length} schema object(s) ready.`, status: groupMissing.length ? 'needs_check' : 'ready', priority: groupMissing.length ? 'high' : 'normal', route: '/api/os-command/schema-status', source: 'schema' };
  });
  cards.unshift({ id: 'schema-overall', title: 'Database schema readiness', summary: `${ready.length} ready · ${missing.length} missing or unavailable.`, status: missing.length ? 'needs_check' : 'ready', priority: missing.length ? 'high' : 'normal', route: '/api/os-command/schema-status', source: 'schema' });
  return cards;
}

function healthCards(health: any, sourceMap: any, schema: any): OsCard[] {
  const sourceCount = Object.keys(sourceMap?.sources || {}).length;
  const missingSchema = Object.values(schema || {}).filter((ok) => !ok).length;
  return [
    { id: 'os-sources-health', title: 'OS source map', summary: `${sourceCount} existing system surface(s) mapped into the one journey OS.`, status: sourceCount ? 'connected' : 'check', priority: sourceCount ? 'normal' : 'medium', route: '/api/os-command/young-person/1/workspace/sources', source: 'source_map' },
    { id: 'schema-health', title: 'Schema status', summary: missingSchema ? `${missingSchema} schema object(s) need checking.` : 'Workspace schema is ready.', status: missingSchema ? 'needs_check' : 'ready', priority: missingSchema ? 'high' : 'normal', route: '/api/os-command/schema-status', source: 'schema' },
    { id: 'notification-health', title: 'Notification feed health', summary: text(health?.status, 'Notification feed health route available.'), status: text(health?.status, 'unknown'), priority: health?.status === 'ok' ? 'normal' : 'medium', route: '/notifications', source: 'notifications' },
  ];
}

export async function getOneJourneyOsState(): Promise<OneJourneyOsState> {
  const [meToday, homeToday, childrenData, schemaStatus, connectUnread, notificationFeed, notificationHealth, managerBrief, inspection] = await Promise.all([
    getJson<any>('/api/me/today', {}),
    getJson<any>('/api/home/today', {}),
    getJson<any>('/api/os-command/young-people', { young_people: [] }),
    getJson<any>('/api/os-command/schema-status', {}),
    getJson<any>('/api/connect/unread', { count: 0, threads: [] }),
    getJson<any>('/api/notifications/operational-feed?unread_only=true&limit=30', { items: [], unread: 0 }),
    getJson<any>('/api/notifications/operational-feed/health', {}),
    getJson<any>('/api/manager-daily-brief', {}),
    getJson<any>('/inspection-readiness/dashboard', {}),
  ]);
  const children = normaliseChildren(childrenData);
  const selectedChild = children[0] || null;
  const childId = selectedChild?.id || '1';
  const sourceMap = await getJson<any>(`/api/os-command/young-person/${encodeURIComponent(childId)}/workspace/sources`, {});
  const schema = schemaCards(schemaStatus);

  return {
    adult: meToday?.adult || null,
    home: meToday?.home || homeToday?.home || null,
    provider: meToday?.provider || null,
    children,
    selectedChild,
    notifications: notificationCards(notificationFeed),
    connect: connectCards(meToday, connectUnread),
    today: meTodayCards(meToday),
    manager: managerBriefCards(managerBrief),
    inspection: inspectionCards(inspection),
    apps: sourceMapApps(sourceMap),
    health: healthCards(notificationHealth, sourceMap, schemaStatus),
    schema,
    sourceMap: sourceMap?.sources || {},
    generatedAt: new Date().toISOString(),
  };
}
