'use client'

import { useEffect, useState } from 'react'
import { getOneJourneyOsState, type OneJourneyOsState, type OsCard, type OsChild } from '@/lib/oneJourneyOs'

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

function ChildCard({ child }: { child: OsChild }) {
  return (
    <a href={child.route} className="block rounded-[1.5rem] border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white">
          {(child.preferredName || child.name).slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Child profile</div>
          <h3 className="mt-1 text-xl font-black text-slate-950">{child.name}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{child.currentState || 'Open the child profile to continue their journey.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            {child.age ? <span className="rounded-full bg-slate-100 px-3 py-1">Age {child.age}</span> : null}
            {child.riskLevel ? <span className="rounded-full bg-slate-100 px-3 py-1">{child.riskLevel}</span> : null}
            {child.status ? <span className="rounded-full bg-slate-100 px-3 py-1">{child.status}</span> : null}
          </div>
        </div>
      </div>
    </a>
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
  const child = state?.selectedChild

  return (
    <main className="min-h-screen bg-[#eef4fb] p-6 text-slate-950">
      <header className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">IndiCare One Journey OS</div>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.08em]">Start with the child</h1>
        <p className="mt-3 text-sm font-semibold text-slate-600">{status}. Hi {adult}. After home selection, the first meaningful OS surface should be the child profile: their story, risks, plans, voice, evidence, actions and support journey.</p>
        <div className="mt-6 grid grid-cols-[1.4fr_0.6fr] gap-4 max-[900px]:grid-cols-1">
          {child ? <ChildCard child={child} /> : <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-slate-500">No child profile returned yet. Check `/api/os-command/young-people` and schema status.</div>}
          <a href={child?.route || '/young-people/1/workspace'} className="flex items-center justify-center rounded-[1.5rem] bg-blue-600 p-6 text-center text-white shadow-sm">
            <span><span className="block text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Primary action</span><span className="mt-2 block text-2xl font-black">Open child profile</span></span>
          </a>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-3 max-[1000px]:grid-cols-2">
          <a href="#children" className="rounded-2xl bg-slate-950 p-4 text-white"><div className="text-xs font-black uppercase opacity-60">Children</div><div className="mt-1 text-3xl font-black">{state?.children.length || 0}</div></a>
          <a href="#notifications" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Notifications</div><div className="mt-1 text-3xl font-black">{state?.notifications.length || 0}</div></a>
          <a href="#connect" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Connect unread</div><div className="mt-1 text-3xl font-black">{connectUnread}</div></a>
          <a href="#schema" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Schema checks</div><div className="mt-1 text-3xl font-black">{state?.schema.length || 0}</div></a>
          <a href="#apps" className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-black uppercase text-slate-400">Apps</div><div className="mt-1 text-3xl font-black">{state?.apps.length || 0}</div></a>
        </div>
      </header>
      <section id="children" className="mt-6 rounded-[1.5rem] bg-white/70 p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Children in this home</h2>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{state?.children.length || 0}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
          {state?.children.length ? state.children.map((item) => <ChildCard key={item.id} child={item} />) : <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500">No children returned yet.</p>}
        </div>
      </section>
      <div className="mt-6 grid grid-cols-2 gap-5 max-[1000px]:grid-cols-1">
        <List title="Today" items={[...(state?.today || []), ...(state?.manager || [])]} />
        <List title="Notifications" items={state?.notifications || []} />
        <List title="Connect" items={state?.connect || []} />
        <List title="Inspection" items={state?.inspection || []} />
        <div id="schema"><List title="Schema readiness" items={state?.schema || []} /></div>
        <List title="Connected apps" items={state?.apps || []} />
        <List title="System health" items={state?.health || []} />
      </div>
    </main>
  )
}
