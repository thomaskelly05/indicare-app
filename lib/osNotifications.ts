export type OsNotificationItem = {
  id: string;
  notification_key?: string | null;
  type: string;
  title: string;
  safe_summary?: string;
  summary?: string;
  severity?: 'low' | 'medium' | 'high' | 'urgent' | string;
  status?: string;
  unread?: boolean;
  route?: string;
  action_label?: string | null;
  source?: string;
  category?: string | null;
  child_id?: number | null;
  child_name?: string | null;
  home_id?: number | null;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

export type OsNotificationFeed = {
  items: OsNotificationItem[];
  unread?: number;
  unread_count?: number;
  urgent?: number;
  urgent_count?: number;
  recording_alert_count?: number;
  recording_count?: number;
  isn_count?: number;
  daily_brief_count?: number;
  review_count?: number;
  action_count?: number;
  governance_count?: number;
  categories?: Record<string, number>;
  limitations?: string[];
  available?: boolean;
  metadata?: Record<string, unknown>;
};

export type UnifiedNotificationState = {
  totalUnread: number;
  urgent: number;
  operational: OsNotificationFeed;
  connectUnread: number;
  legacyUnread: number;
  available: boolean;
};

const apiBase = process.env.NEXT_PUBLIC_INDICARE_API_BASE || '';

async function readJson<T>(response: Response, fallback: T): Promise<T> {
  if (!response.ok) return fallback;
  const payload = await response.json().catch(() => fallback as unknown);
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as { data?: T }).data || fallback) as T;
  }
  return payload as T;
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return await readJson<T>(response, fallback);
  } catch {
    return fallback;
  }
}

export async function getOperationalNotificationFeed(params?: { unread_only?: boolean; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.unread_only) qs.set('unread_only', 'true');
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return getJson<OsNotificationFeed>(`/api/notifications/operational-feed${suffix}`, {
    items: [],
    unread: 0,
    unread_count: 0,
    urgent: 0,
    urgent_count: 0,
    available: false,
    categories: {},
    limitations: [],
  });
}

export async function getUnifiedNotifications(limit = 20): Promise<UnifiedNotificationState> {
  const [operational, connect, legacy] = await Promise.all([
    getOperationalNotificationFeed({ unread_only: true, limit }),
    getJson<{ count?: number }>(`/api/connect/unread`, { count: 0 }),
    getJson<{ unread?: number; items?: unknown[] }>(`/api/notifications?unread_only=true&limit=${limit}`, { unread: 0, items: [] }),
  ]);

  const operationalUnread = Number(operational.unread_count ?? operational.unread ?? 0);
  const connectUnread = Number(connect.count || 0);
  const legacyUnread = Number(legacy.unread || 0);
  const urgent = Number(operational.urgent_count ?? operational.urgent ?? 0);

  return {
    totalUnread: operationalUnread + connectUnread + legacyUnread,
    urgent,
    operational,
    connectUnread,
    legacyUnread,
    available: Boolean(operational.available || operational.items?.length || connectUnread || legacyUnread),
  };
}

export async function applyNotificationAction(
  notificationKey: string,
  action: 'mark_read' | 'mark_unread' | 'acknowledge' | 'assign' | 'resolve' | 'archive' | 'reopen',
  metadata?: Record<string, unknown>,
) {
  const response = await fetch(`${apiBase}/api/notifications/${encodeURIComponent(notificationKey)}/action`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, metadata: metadata || {} }),
  });
  return readJson(response, { success: false });
}

export async function markAllNotificationsRead(notificationKeys?: string[]) {
  const response = await fetch(`${apiBase}/api/notifications/mark-all-read`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification_keys: notificationKeys || [] }),
  });
  return readJson(response, { success: false });
}
