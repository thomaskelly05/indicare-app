'use client'

import { useEffect, useState } from 'react'
import { getOneJourneyOsState, type OneJourneyOsState, type OsCard } from '@/lib/oneJourneyOs'

function Card({ item }: { item: OsCard }) {
  return (
    <a href={item.route || '#'} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">{item.source || item.status || 'OS'}</div>
      <div className="mt-2 text-base font-black text-slate-950">{item.title}</div>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.summary}</p>
    </a>
  )
}

function List({ title, items }: { title: string; items: OsCard[] }) {
  return (
    <section className="rounded-[1.5rem] bg-white/70 p-5 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{items.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => <Card key={item.id} item={item} />) : <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500">Nothing live in this area yet.</p>}
      </div>
    </section>
  )
}

export function LiveOsHome() {
  const [state, setState] = useState<OneJourneyOsState | null>(null)
  const [status, setStatus] = useState('Loading live OS')

  async function load() {
    setStatus('Refreshing')
    setState(await getOneJourneyOsState())
    setStatus('Connected')
  }

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const adult = String(state?.adult?.preferred_name || state?.adult?.name || state?.adult?.email || 'there')
  const connectUnread = state?.connect.reduce((sum, item) => sum + Number(item.count || 0), 0) || 0

  return (
    <main className="min-h-screen bg-[#eef4fb] p-6 text-slate-950">
      <header className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">IndiCare One Journey OS</div>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.08em]">Good morning, {adult}</h1>
        <p className="mt-3 text-sm font-semibold text-slate-600">{status}. Messages, notifications, daily brief, inspection, apps and child workspace are now pulled into one operating surface.</p>
        <div className="mt-5 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <a href="#notifications" className="rounded-2xl bg-slate-950 p-4 text-white"><div className="text-xs font-black uppercase opacity-60">Notifications</div><div className="mt-1 text-3xl font-black">{state?.notifications.length || 0}</div></a>
          <a href="#connect" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Connect unread</div><div className="mt-1 text-3xl font-black">{connectUnread}</div></a>
          <a href="#apps" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Apps</div><div className="mt-1 text-3xl font-black">{state?.apps.length || 0}</div></a>
          <a href="/young-people/1/workspace" className="rounded-2xl bg-blue-600 p-4 text-white"><div className="text-xs font-black uppercase opacity-70">Child OS</div><div className="mt-1 text-lg font-black">Open</div></a>
        </div>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-5 max-[1000px]:grid-cols-1">
        <List title="Today" items={[...(state?.today || []), ...(state?.manager || [])]} />
        <List title="Notifications" items={state?.notifications || []} />
        <List title="Connect" items={state?.connect || []} />
        <List title="Inspection" items={state?.inspection || []} />
        <List title="Connected apps" items={state?.apps || []} />
        <List title="System health" items={state?.health || []} />
      </div>
    </main>
  )
}
