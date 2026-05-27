'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyNotificationAction,
  getUnifiedNotifications,
  markAllNotificationsRead,
  type OsNotificationItem,
  type UnifiedNotificationState,
} from '@/lib/osNotifications'

function itemKey(item: OsNotificationItem) {
  return item.notification_key || item.id
}

function severityClass(severity?: string) {
  if (severity === 'urgent' || severity === 'high') return 'border-red-200 bg-red-50 text-red-900'
  if (severity === 'medium') return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-slate-200 bg-white text-slate-700'
}

export function NotificationBell() {
  const [state, setState] = useState<UnifiedNotificationState | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setState(await getUnifiedNotifications(20))
  }, [])

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(), 60000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  async function runAction(item: OsNotificationItem, action: 'mark_read' | 'acknowledge' | 'resolve' | 'archive') {
    const key = itemKey(item)
    setBusy(key)
    try {
      await applyNotificationAction(key, action, { item_type: item.type, category: item.category })
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function markAllRead() {
    setBusy('all')
    try {
      await markAllNotificationsRead(state?.operational.items.map(itemKey))
      await load()
    } finally {
      setBusy(null)
    }
  }

  const total = state?.totalUnread || 0
  const urgent = state?.urgent || 0
  const items = state?.operational.items?.slice(0, 8) || []

  return (
    <div ref={rootRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm"
        aria-label="Notifications"
      >
        Notifications
        {total ? (
          <span className="absolute -right-2 -top-2 min-w-6 rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
            {total > 99 ? '99+' : total}
          </span>
        ) : null}
        {urgent ? (
          <span className="absolute -bottom-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
            {urgent}
          </span>
        ) : null}
      </button>

      {open ? (
        <section className="absolute right-0 mt-3 w-[min(92vw,24rem)] rounded-[1.5rem] border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Adult notifications</div>
              <div className="mt-1 text-sm font-black">{total} unread · {urgent} urgent</div>
            </div>
            <button
              type="button"
              disabled={busy === 'all'}
              onClick={() => void markAllRead()}
              className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {items.length ? items.map((item) => (
              <article key={itemKey(item)} className={`rounded-2xl border p-3 ${severityClass(item.severity)}`}>
                <div className="flex items-start justify-between gap-2">
                  <a href={item.route || '/notifications'} className="min-w-0 flex-1" onClick={() => setOpen(false)}>
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] opacity-60">{item.category || item.source || item.type}</div>
                    <h3 className="mt-1 text-sm font-black">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 opacity-80">{item.safe_summary || item.summary}</p>
                    {item.action_label ? <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">{item.action_label}</p> : null}
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.unread ? <button disabled={busy === itemKey(item)} onClick={() => void runAction(item, 'mark_read')} className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">Read</button> : null}
                  <button disabled={busy === itemKey(item)} onClick={() => void runAction(item, 'acknowledge')} className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">Acknowledge</button>
                  <button disabled={busy === itemKey(item)} onClick={() => void runAction(item, 'resolve')} className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">Resolve</button>
                  <button disabled={busy === itemKey(item)} onClick={() => void runAction(item, 'archive')} className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">Archive</button>
                </div>
              </article>
            )) : (
              <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No operational notifications in scope.</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-[10px] font-black uppercase tracking-[0.12em]">
            <a href="/connect" className="rounded-full bg-blue-50 px-2 py-2 text-blue-800" onClick={() => setOpen(false)}>Connect {state?.connectUnread || 0}</a>
            <a href="/record/alerts" className="rounded-full bg-red-50 px-2 py-2 text-red-800" onClick={() => setOpen(false)}>Alerts</a>
            <a href="/command-centre/briefing" className="rounded-full bg-slate-50 px-2 py-2 text-slate-800" onClick={() => setOpen(false)}>Brief</a>
          </div>
        </section>
      ) : null}
    </div>
  )
}
