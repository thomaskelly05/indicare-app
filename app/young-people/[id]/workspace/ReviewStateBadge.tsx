"use client";

const good = new Set(["approved", "signed_off", "reviewed", "resolved", "closed", "completed", "ready"]);
const urgent = new Set(["overdue", "missing", "gap", "changes_requested"]);
const waiting = new Set(["submitted", "pending", "due_soon", "waiting"]);
const active = new Set(["open", "in_progress"]);

export function normaliseReviewState(value?: string | null) {
  const state = String(value || "unknown").toLowerCase().replaceAll(" ", "_");
  if (state.includes("change")) return "changes_requested";
  if (state.includes("approve")) return "approved";
  if (state.includes("sign")) return "signed_off";
  if (state.includes("review")) return "reviewed";
  if (state.includes("due")) return "due_soon";
  return state;
}

function labelFor(state: string) {
  return state
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function classFor(state: string) {
  if (good.has(state)) return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (urgent.has(state)) return "border-red-200 bg-red-50 text-red-900";
  if (waiting.has(state)) return "border-amber-200 bg-amber-50 text-amber-900";
  if (active.has(state)) return "border-blue-200 bg-blue-50 text-blue-900";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function ReviewStateBadge({ status }: { status?: string | null }) {
  const state = normaliseReviewState(status);
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${classFor(state)}`}>{labelFor(state)}</span>;
}

export function needsManagerAttention(status?: string | null) {
  const state = normaliseReviewState(status);
  return urgent.has(state) || waiting.has(state) || active.has(state);
}

export function statusWeight(status?: string | null) {
  const state = normaliseReviewState(status);
  if (urgent.has(state)) return 0;
  if (waiting.has(state)) return 1;
  if (active.has(state)) return 2;
  return 3;
}
