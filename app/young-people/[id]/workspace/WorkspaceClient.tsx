"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { askChildWorkspaceOrb, getChildWorkspace, saveChildWorkspaceItem } from "@/lib/childWorkspaceApi";
import { defaultRecordDetails, RecordExtraFields } from "./RecordExtraFields";

type Priority = "critical" | "high" | "medium" | "low" | "normal";

type WorkspaceRecord = {
  id: string;
  type: string;
  title: string;
  summary: string;
  status: string;
  priority?: Priority;
  date?: string;
  evidence?: string;
  action?: string;
  owner?: string;
};

type WorkspaceData = {
  child: {
    id: string;
    name: string;
    preferredName: string;
    age: number;
    status: string;
    riskLevel: string;
    home: string;
    placementDay: number;
    currentState: string;
    keyWorker: string;
    socialWorker: string;
    legalStatus: string;
    communication: string;
    whatHelps: string;
  };
  records: WorkspaceRecord[];
  reviews: WorkspaceRecord[];
  plans: WorkspaceRecord[];
  alerts: WorkspaceRecord[];
  documents: WorkspaceRecord[];
  lifeEcho: WorkspaceRecord[];
  handover: WorkspaceRecord[];
  childVoice: WorkspaceRecord[];
  appointments: WorkspaceRecord[];
  commandItems: WorkspaceRecord[];
  schemaStatus: Record<string, boolean>;
};

const tabs = ["Overview", "Record", "Chronology", "Plans", "Reviews", "Alerts", "Appointments", "Documents", "LifeEcho", "Handover", "Child Voice", "Database"];

const recordRoutes = ["Daily note", "Incident", "Safeguarding concern", "Missing episode", "Keywork", "Direct work", "Health update", "Education update", "Family contact", "Appointment", "Manager note", "LifeEcho memory", "Child Voice", "Handover"];

const fallbackWorkspace: WorkspaceData = {
  child: {
    id: "1",
    name: "Jamie Smith",
    preferredName: "Jamie",
    age: 15,
    status: "Active",
    riskLevel: "Medium",
    home: "Oak House",
    placementDay: 114,
    currentState: "Settled with contact-related anxiety",
    keyWorker: "Sarah Johnson",
    socialWorker: "A. Patel",
    legalStatus: "Section 20 accommodated",
    communication: "Jamie responds best to calm, direct language and time to process change.",
    whatHelps: "Predictable routines, visual plans, quiet space, trusted adults and clear choices.",
  },
  records: [{ id: "fallback-daily", type: "Daily note", title: "Evening support and emotional regulation", summary: "Jamie accepted reassurance, completed the evening routine and remained settled.", status: "Submitted", priority: "normal", date: "Today", evidence: "Routine completed and child spoken with privately.", action: "Keep the plan visible during handover.", owner: "Night staff" }],
  reviews: [],
  plans: [],
  alerts: [],
  documents: [],
  lifeEcho: [],
  handover: [],
  childVoice: [],
  appointments: [],
  commandItems: [],
  schemaStatus: {},
};

function normalisePriority(value: unknown): Priority {
  const priority = String(value || "normal").toLowerCase();
  if (["critical", "high", "medium", "low", "normal"].includes(priority)) return priority as Priority;
  if (priority === "moderate" || priority === "urgent") return "high";
  return "normal";
}

function priorityClass(priority?: Priority) {
  if (priority === "critical") return "border-red-200 bg-red-50 text-red-900";
  if (priority === "high") return "border-orange-200 bg-orange-50 text-orange-900";
  if (priority === "medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-white text-slate-900";
}

function displayDate(value: unknown) {
  if (!value) return "";
  try {
    return new Date(String(value)).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(value);
  }
}

function recordFromApi(item: any, index: number, typeFallback: string): WorkspaceRecord {
  return {
    id: String(item?.id || item?.feed_id || item?.command_item_id || `${typeFallback}-${index}`),
    type: String(item?.type || item?.record_type || item?.domain || item?.appointment_type || typeFallback),
    title: String(item?.title || item?.context || item?.summary || typeFallback),
    summary: String(item?.summary || item?.narrative || item?.voice_text || item?.recommended_action || "Open this item to review the evidence and update the action."),
    status: String(item?.status || item?.workflow_status || item?.review_state || "Open"),
    priority: normalisePriority(item?.priority || item?.severity),
    date: displayDate(item?.occurred_at || item?.event_at || item?.appointment_date || item?.created_at || item?.next_review_due || item?.due_at),
    evidence: String(item?.evidence || item?.evidence_summary || item?.source_table || item?.professional_name || "Evidence available in the linked record."),
    action: String(item?.recommended_action || item?.action || item?.next_step || item?.follow_up_actions || "Review, update and sign off where required."),
    owner: String(item?.owner || item?.assigned_to || item?.created_by || item?.recorded_by || "IndiCare"),
  };
}

function normaliseApiWorkspace(raw: any, childId: string): WorkspaceData {
  const profile = raw?.profile || raw?.young_person || raw?.child || {};
  return {
    child: {
      id: String(profile?.young_person_id || profile?.id || childId),
      name: String(profile?.display_name || profile?.name || "Young person"),
      preferredName: String(profile?.preferred_name || profile?.first_name || "Young person"),
      age: Number(profile?.age || 15),
      status: String(profile?.placement_status || profile?.status || "Active"),
      riskLevel: String(profile?.summary_risk_level || profile?.risk_level || profile?.os_state || "Medium"),
      home: String(profile?.home_name || profile?.home || "Current home"),
      placementDay: Number(profile?.placement_day || profile?.days_in_placement || 0),
      currentState: String(profile?.current_state || profile?.presentation || "Workspace ready"),
      keyWorker: String(profile?.key_worker_name || profile?.key_worker || "Key worker"),
      socialWorker: String(profile?.social_worker_name || "Social worker"),
      legalStatus: String(profile?.legal_status || profile?.legal_status_summary || "Legal status not recorded"),
      communication: String(profile?.communication || "Check the child understanding section before recording."),
      whatHelps: String(profile?.what_helps || "Use the current plan and record what helped."),
    },
    records: (raw?.care_records || raw?.timeline || []).map((item: any, index: number) => recordFromApi(item, index, "Record")),
    reviews: (raw?.care_plan_reviews || []).map((item: any, index: number) => recordFromApi(item, index, "Review")),
    plans: (raw?.plans || raw?.care_plan_reviews || []).map((item: any, index: number) => recordFromApi(item, index, "Plan")),
    alerts: [...(raw?.alerts || []), ...(raw?.safeguarding_patterns || []), ...(raw?.command_items || [])].map((item: any, index: number) => recordFromApi(item, index, "Alert")),
    documents: (raw?.documents || []).map((item: any, index: number) => recordFromApi(item, index, "Document")),
    lifeEcho: (raw?.life_echo || raw?.lifeEcho || []).map((item: any, index: number) => recordFromApi(item, index, "LifeEcho")),
    handover: (raw?.handover || []).map((item: any, index: number) => recordFromApi(item, index, "Handover")),
    childVoice: (raw?.child_voice || raw?.childVoice || []).map((item: any, index: number) => recordFromApi(item, index, "Child voice")),
    appointments: (raw?.appointments || raw?.health || []).map((item: any, index: number) => recordFromApi(item, index, "Appointment")),
    commandItems: (raw?.command_items || []).map((item: any, index: number) => recordFromApi(item, index, "Command item")),
    schemaStatus: raw?.schema_status || {},
  };
}

export function WorkspaceClient({ childId }: { childId: string }) {
  const [workspace, setWorkspace] = useState<WorkspaceData>(fallbackWorkspace);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState<WorkspaceRecord | null>(null);
  const [recordDetails, setRecordDetails] = useState<Record<string, string>>({});
  const [orbMode, setOrbMode] = useState("overview");
  const [orbDraft, setOrbDraft] = useState("He kicked off after the phone call. Staff dealt with it.");
  const [orbAnswer, setOrbAnswer] = useState("ORB is connected to this child workspace. Ask about reviews, appointments, recording, evidence gaps or therapeutic wording.");
  const [orbEvidence, setOrbEvidence] = useState<WorkspaceRecord[]>([]);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [loadingState, setLoadingState] = useState("Loading workspace...");
  const [saveState, setSaveState] = useState("All local changes are ready to save.");

  const loadWorkspace = useCallback(async (message = "Loading live workspace...") => {
    setLoadingState(message);
    const result = await getChildWorkspace(childId);
    if (result.ok && result.data) {
      setWorkspace(normaliseApiWorkspace(result.data, childId));
      const status = result.data.schema_status || {};
      const missing = Object.entries(status).filter(([, ok]) => !ok).length;
      setLoadingState(missing ? `Live workspace connected · ${missing} schema check(s) missing` : "Live workspace connected · database ready");
      return true;
    }
    setLoadingState("Using safe fallback workspace until live data is available.");
    return false;
  }, [childId]);

  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);

  function openItem(item: WorkspaceRecord) {
    setSelected(item);
    setRecordDetails(defaultRecordDetails(item.type));
  }

  function newItem(type: string) {
    openItem({ id: `new-${type}-${Date.now()}`, type, title: type, summary: "", status: "Draft", priority: "normal", evidence: "", action: "", owner: "Current user" });
  }

  const allItems = useMemo(() => [...workspace.commandItems, ...workspace.records, ...workspace.reviews, ...workspace.plans, ...workspace.alerts, ...workspace.appointments, ...workspace.documents, ...workspace.lifeEcho, ...workspace.handover, ...workspace.childVoice], [workspace]);

  const databaseItems = useMemo(() => Object.entries(workspace.schemaStatus).map(([name, ok]) => ({ id: `schema-${name}`, type: ok ? "Schema ready" : "Schema missing", title: name, summary: ok ? "This database object is available to the child workspace." : "This database object is missing or unavailable. Check TablePlus/migrations before relying on this feature.", status: ok ? "Ready" : "Missing", priority: ok ? "normal" as Priority : "high" as Priority, evidence: "Backend /api/os-command/schema-status", action: ok ? "No action required." : "Run or check the relevant schema migration.", owner: "Database" })), [workspace.schemaStatus]);

  const activeItems = useMemo(() => {
    if (activeTab === "Overview") return [...workspace.commandItems, ...workspace.alerts, ...workspace.reviews, ...workspace.records].slice(0, 10);
    if (activeTab === "Record") return workspace.records;
    if (activeTab === "Chronology") return allItems;
    if (activeTab === "Plans") return workspace.plans;
    if (activeTab === "Reviews") return workspace.reviews;
    if (activeTab === "Alerts") return [...workspace.commandItems, ...workspace.alerts];
    if (activeTab === "Appointments") return workspace.appointments;
    if (activeTab === "Documents") return workspace.documents;
    if (activeTab === "LifeEcho") return workspace.lifeEcho;
    if (activeTab === "Handover") return workspace.handover;
    if (activeTab === "Child Voice") return workspace.childVoice;
    if (activeTab === "Database") return databaseItems;
    return [];
  }, [activeTab, allItems, databaseItems, workspace]);

  function replaceItem(updated: WorkspaceRecord) {
    const replace = (items: WorkspaceRecord[]) => items.some((item) => item.id === updated.id) ? items.map((item) => item.id === updated.id ? updated : item) : items;
    setWorkspace((current) => ({ ...current, commandItems: replace(current.commandItems), records: activeTab === "Record" && !current.records.some((item) => item.id === updated.id) ? [updated, ...current.records] : replace(current.records), reviews: activeTab === "Reviews" && !current.reviews.some((item) => item.id === updated.id) ? [updated, ...current.reviews] : replace(current.reviews), plans: activeTab === "Plans" && !current.plans.some((item) => item.id === updated.id) ? [updated, ...current.plans] : replace(current.plans), alerts: activeTab === "Alerts" && !current.alerts.some((item) => item.id === updated.id) ? [updated, ...current.alerts] : replace(current.alerts), appointments: activeTab === "Appointments" && !current.appointments.some((item) => item.id === updated.id) ? [updated, ...current.appointments] : replace(current.appointments), documents: activeTab === "Documents" && !current.documents.some((item) => item.id === updated.id) ? [updated, ...current.documents] : replace(current.documents), lifeEcho: activeTab === "LifeEcho" && !current.lifeEcho.some((item) => item.id === updated.id) ? [updated, ...current.lifeEcho] : replace(current.lifeEcho), handover: activeTab === "Handover" && !current.handover.some((item) => item.id === updated.id) ? [updated, ...current.handover] : replace(current.handover), childVoice: activeTab === "Child Voice" && !current.childVoice.some((item) => item.id === updated.id) ? [updated, ...current.childVoice] : replace(current.childVoice) }));
  }

  function updateSelected(field: keyof WorkspaceRecord, value: string) {
    if (!selected) return;
    const updated = { ...selected, [field]: value };
    setSelected(updated);
    replaceItem(updated);
    setSaveState("Unsaved changes.");
  }

  async function saveSelected() {
    if (!selected) return;
    if (selected.id.startsWith("schema-")) { setSaveState("Database status items are read-only."); return; }
    setSaveState("Saving...");
    const result = await saveChildWorkspaceItem(childId, { item_id: selected.id, item_type: selected.type, title: selected.title, summary: selected.summary, status: selected.status, priority: selected.priority, evidence: selected.evidence, action: selected.action, owner: selected.owner, payload: { tab: activeTab, date: selected.date, ...recordDetails } });
    const data = result.data || {};
    if (result.ok && data.saved !== false) {
      setSaveState(`Saved to ${data.table || "workspace"}. Refreshing from database...`);
      setSelected(null);
      setRecordDetails({});
      await loadWorkspace("Refreshing saved record from TablePlus...");
      setSaveState(`Saved to ${data.table || "workspace"}.`);
      return;
    }
    setSaveState(data.message || `Save failed (${result.status}). Kept locally.`);
  }

  async function runOrb(question: string) {
    setOrbMode(question);
    setOrbAnswer("ORB is checking the child workspace...");
    const result = await askChildWorkspaceOrb(childId, { question, draft_text: orbDraft, context: selected ? { ...selected, ...recordDetails } : { activeTab } });
    if (result.ok && result.data?.answer) {
      setOrbAnswer(String(result.data.answer));
      setOrbEvidence(Array.isArray(result.data.evidence) ? result.data.evidence.map((item: any, index: number) => recordFromApi(item, index, "Evidence")) : []);
      return;
    }
    setOrbAnswer("ORB could not reach the workspace brain. Use the local guidance and try again shortly.");
  }

  const actionRail = [...workspace.commandItems, ...workspace.alerts, ...workspace.handover].slice(0, 5);
  const schemaMissing = Object.values(workspace.schemaStatus).filter((ok) => !ok).length;

  return (
    <main className="min-h-screen bg-[#eef4fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)_336px] max-[1180px]:grid-cols-[230px_minmax(0,1fr)] max-[900px]:block">
        <aside className="sticky top-0 h-screen overflow-y-auto border-r border-slate-200 bg-[#030918] p-4 text-white max-[900px]:relative max-[900px]:h-auto">
          <button className="mb-4 flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-left" onClick={() => setActiveTab("Overview")} type="button"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 font-black">IC</span><span><span className="block text-[10px] font-black uppercase tracking-[0.35em] text-blue-200">IndiCare OS</span><span className="block text-sm font-black">Child-centred OS</span></span></button>
          <div className="rounded-3xl border border-white/10 bg-slate-800/70 p-4"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Atmosphere</div><div className="mt-2 font-bold">{workspace.child.preferredName} workspace</div><div className="mt-1 text-xs text-slate-400">{workspace.child.currentState}</div></div>
          <nav className="mt-6 space-y-6"><section><div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Child - primary</div>{tabs.slice(0, 7).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`mb-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}><span>{tab}</span><span className="text-xs opacity-60">›</span></button>)}</section><section><div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Child - more</div>{tabs.slice(7).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`mb-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}><span>{tab}</span><span className="text-xs opacity-60">›</span></button>)}</section></nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur max-[900px]:relative"><div className="flex items-center justify-between gap-4 max-[760px]:block"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">Operational top bar</div><h1 className="text-xl font-black tracking-tight">{workspace.child.name}'s journey</h1><p className="mt-1 text-xs font-bold text-slate-500">{loadingState} · {saveState}</p></div><div className="flex items-center gap-2 max-[760px]:mt-4"><button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-500 shadow-sm" type="button" onClick={() => void loadWorkspace("Refreshing workspace from database...")}>Refresh</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-500 shadow-sm" type="button" onClick={() => setActiveTab("Database")}>{schemaMissing ? `${schemaMissing} schema issues` : "DB ready"}</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-500 shadow-sm" type="button" onClick={() => runOrb("What would Ofsted ask?")}>Ask ORB</button><button className="rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-sm" type="button" onClick={() => setActiveTab("Record")}>Quick record</button></div></div><div className="mt-4 flex gap-2 overflow-x-auto">{tabs.slice(0, 7).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.18em] ${activeTab === tab ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>{tab}</button>)}</div></header>
          <div className="p-6">
            <section className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]"><div className="flex items-start gap-6 max-[760px]:block"><button type="button" onClick={() => setIsEditingChild(true)} className="grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-sky-400 to-blue-700 text-4xl font-black text-white shadow-xl max-[760px]:mb-4">{workspace.child.preferredName.slice(0, 2).toUpperCase()}</button><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">Child workspace</div><h2 className="mt-3 text-5xl font-black tracking-[-0.08em] max-[760px]:text-4xl">{workspace.child.name}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Known as <strong>{workspace.child.preferredName}</strong>. {workspace.child.communication} {workspace.child.whatHelps}</p><div className="mt-5 flex flex-wrap gap-2">{[`Age ${workspace.child.age}`, workspace.child.status, workspace.child.riskLevel, workspace.child.legalStatus, `${workspace.appointments.length} appointments`, `${workspace.childVoice.length} voice entries`].map((item) => <button key={item} type="button" onClick={() => item.includes("appointment") ? setActiveTab("Appointments") : item.includes("voice") ? setActiveTab("Child Voice") : setIsEditingChild(true)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">{item}</button>)}</div></div></div></section>
            <section className="mt-6 grid grid-cols-[1fr_1fr_1fr] gap-5 max-[1000px]:grid-cols-1"><button type="button" onClick={() => runOrb("What needs manager review?")} className="rounded-[1.6rem] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Current state</div><h3 className="mt-3 text-2xl font-black">Understand this child</h3><p className="mt-3 text-sm leading-7 text-slate-600">What matters, communication, strengths, routines, triggers and how best to support.</p></button><button type="button" onClick={() => setActiveTab("Alerts")} className="rounded-[1.6rem] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Safety net</div><h3 className="mt-3 text-2xl font-black">{workspace.commandItems.length + workspace.alerts.length} live action(s)</h3><p className="mt-3 text-sm leading-7 text-slate-600">Command items, safeguarding, evidence, review and overdue action prompts.</p></button><button type="button" onClick={() => setActiveTab("Appointments")} className="rounded-[1.6rem] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">Health / diary</div><h3 className="mt-3 text-2xl font-black">{workspace.appointments.length} appointment(s)</h3><p className="mt-3 text-sm leading-7 text-slate-600">Drawn directly from the database appointment table.</p></button></section>
            {activeTab === "Record" && <section className="mt-6 rounded-[1.6rem] bg-white p-6 shadow-sm"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">Record routes</div><h3 className="mt-2 text-2xl font-black">Choose what you are recording</h3><p className="mt-2 text-sm text-slate-600">Every route now opens fields that match the canonical database table.</p><div className="mt-5 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">{recordRoutes.map((route) => <button key={route} type="button" onClick={() => newItem(route)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left font-black transition hover:border-blue-300 hover:bg-blue-50">{route}<span className="mt-1 block text-xs font-semibold text-slate-500">Open typed record form</span></button>)}</div></section>}
            <section className="mt-6 rounded-[1.6rem] bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{activeTab}</div><h3 className="mt-2 text-2xl font-black">Open, edit and evidence</h3></div><button type="button" onClick={() => newItem(activeTab)} className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white">+ Add</button></div><div className="mt-5 space-y-3">{activeItems.length ? activeItems.map((item) => <button key={item.id} type="button" onClick={() => openItem(item)} className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${priorityClass(item.priority)}`}><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">{item.type} · {item.status} {item.date ? `· ${item.date}` : ""}</div><h4 className="mt-2 text-lg font-black">{item.title}</h4><p className="mt-2 text-sm leading-6 opacity-75">{item.summary}</p><p className="mt-2 text-xs font-bold opacity-60">{item.action}</p></div><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">Open</span></div></button>) : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No items yet. Add one or ask ORB to find linked evidence.</div>}</div></section>
          </div>
        </section>

        <aside className="sticky top-0 h-screen overflow-y-auto border-l border-slate-200 bg-white/70 p-5 backdrop-blur max-[1180px]:col-span-2 max-[1180px]:h-auto max-[900px]:relative"><section className="rounded-[1.4rem] bg-slate-950 p-5 text-white shadow-xl"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">ORB</div><h3 className="mt-3 text-xl font-black">Inspector on your shoulder</h3><p className="mt-3 text-sm leading-6 text-slate-300">Evidence-aware guidance for recording, reviews, appointments, plans and Ofsted readiness.</p><div className="mt-5 space-y-2">{["When was the last LAC review?", "When was the last dentist appointment?", "Rewrite this therapeutically", "What needs manager review?", "What would Ofsted ask?"].map((question) => <button key={question} type="button" onClick={() => runOrb(question)} className="w-full rounded-xl border border-blue-400/40 bg-white/5 px-3 py-3 text-left text-xs font-black text-blue-50 transition hover:bg-blue-500/20">{question}</button>)}</div></section><section className="mt-5 rounded-[1.4rem] bg-white p-5 shadow-sm"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">ORB answer</div><div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{orbAnswer}</div>{orbEvidence.length > 0 && <div className="mt-3 space-y-2">{orbEvidence.map((item) => <button key={item.id} type="button" onClick={() => openItem(item)} className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600"><strong className="block text-slate-900">{item.title}</strong>{item.summary}</button>)}</div>}{orbMode.toLowerCase().includes("therapeutic") && <div className="mt-4"><label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Rough wording</label><textarea value={orbDraft} onChange={(event) => setOrbDraft(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800" /></div>}</section><section className="mt-5 rounded-[1.4rem] bg-white p-5 shadow-sm"><div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">What do I need to do now?</div><div className="mt-4 space-y-3">{actionRail.map((item) => <button key={`todo-${item.id}`} type="button" onClick={() => openItem(item)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-blue-50"><div className="font-black">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.action}</div></button>)}</div></section></aside>
      </div>

      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"><section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">Editable workspace item</div><h3 className="mt-2 text-3xl font-black tracking-tight">{selected.type}</h3></div><button type="button" onClick={() => { setSelected(null); setRecordDetails({}); }} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black">Close</button></div><div className="mt-5 grid gap-4"><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Title<input value={selected.title} onChange={(event) => updateSelected("title", event.target.value)} className="rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Summary<textarea value={selected.summary} onChange={(event) => updateSelected("summary", event.target.value)} className="min-h-28 rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><RecordExtraFields type={selected.type} values={recordDetails} onChange={(name, value) => { setRecordDetails((current) => ({ ...current, [name]: value })); setSaveState("Unsaved changes."); }} /><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Evidence / purpose<textarea value={selected.evidence || ""} onChange={(event) => updateSelected("evidence", event.target.value)} className="min-h-24 rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Action / follow-up<textarea value={selected.action || ""} onChange={(event) => updateSelected("action", event.target.value)} className="min-h-24 rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1"><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Status<input value={selected.status} onChange={(event) => updateSelected("status", event.target.value)} className="rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Owner<input value={selected.owner || ""} onChange={(event) => updateSelected("owner", event.target.value)} className="rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label></div></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={saveSelected} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">Save to workspace</button><button type="button" onClick={() => runOrb("Rewrite this therapeutically")} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">Ask ORB to improve wording</button><button type="button" onClick={() => runOrb("What would Ofsted ask?")} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">Ofsted lens</button></div></section></div>}

      {isEditingChild && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"><section className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600">Edit child understanding</div><h3 className="mt-2 text-3xl font-black tracking-tight">{workspace.child.name}</h3></div><button type="button" onClick={() => setIsEditingChild(false)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black">Close</button></div><div className="mt-5 grid gap-4"><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Communication<textarea value={workspace.child.communication} onChange={(event) => setWorkspace((current) => ({ ...current, child: { ...current.child, communication: event.target.value } }))} className="min-h-24 rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label><label className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">What helps<textarea value={workspace.child.whatHelps} onChange={(event) => setWorkspace((current) => ({ ...current, child: { ...current.child, whatHelps: event.target.value } }))} className="min-h-24 rounded-2xl border border-slate-200 p-4 text-base normal-case tracking-normal text-slate-900" /></label></div><button type="button" onClick={() => { setIsEditingChild(false); setSaveState("Child understanding updated locally."); }} className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">Save locally</button></section></div>}
    </main>
  );
}
