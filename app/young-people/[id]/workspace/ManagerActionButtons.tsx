"use client";

import { applyChildWorkspaceAction, type ChildWorkspaceActionPayload } from "@/lib/childWorkspaceApi";

type WorkspaceRecord = {
  id: string;
  type: string;
  title: string;
  summary: string;
  status: string;
  priority?: "critical" | "high" | "medium" | "low" | "normal";
  date?: string;
  evidence?: string;
  action?: string;
  owner?: string;
  sourceTable?: string;
  sourceId?: string | number;
};

const canonicalTableByType: Record<string, string> = {
  "daily note": "daily_notes",
  incident: "incidents",
  "missing episode": "missing_episodes",
  "safeguarding concern": "safeguarding_records",
  keywork: "keywork_sessions",
  "direct work": "direct_work_sessions",
  "health update": "health_records",
  "education update": "education_records",
  "family contact": "family_contact_records",
  appointment: "young_person_appointments",
  "child voice": "child_voice_entries",
  handover: "handover_records",
  "lifeecho memory": "life_story_entries",
  lifeecho: "life_story_entries",
  review: "os_manager_reviews",
  "manager note": "os_manager_reviews",
};

function normaliseType(type: string) {
  return String(type || "").toLowerCase().trim();
}

function inferTableFromType(type: string) {
  const normalised = normaliseType(type);
  if (canonicalTableByType[normalised]) return canonicalTableByType[normalised];
  if (normalised.includes("appointment")) return "young_person_appointments";
  if (normalised.includes("incident")) return "incidents";
  if (normalised.includes("daily")) return "daily_notes";
  if (normalised.includes("missing")) return "missing_episodes";
  if (normalised.includes("safeguard")) return "safeguarding_records";
  if (normalised.includes("keywork")) return "keywork_sessions";
  if (normalised.includes("direct")) return "direct_work_sessions";
  if (normalised.includes("health")) return "health_records";
  if (normalised.includes("education")) return "education_records";
  if (normalised.includes("family") || normalised.includes("contact")) return "family_contact_records";
  if (normalised.includes("voice")) return "child_voice_entries";
  if (normalised.includes("handover")) return "handover_records";
  if (normalised.includes("life")) return "life_story_entries";
  if (normalised.includes("review") || normalised.includes("manager")) return "os_manager_reviews";
  return undefined;
}

function sourceFromItem(item: WorkspaceRecord) {
  if (item.sourceTable && item.sourceId !== undefined && item.sourceId !== null) {
    return { source_table: item.sourceTable, source_id: item.sourceId };
  }

  if (item.evidence) {
    const trimmed = item.evidence.trim();
    const match = trimmed.match(/^([a-zA-Z0-9_]+):(\d+|[0-9a-fA-F-]{32,36})$/);
    if (match) return { source_table: match[1], source_id: match[2] };
  }

  const table = inferTableFromType(item.type);
  if (table && /^\d+$/.test(String(item.id))) {
    return { source_table: table, source_id: item.id };
  }

  if (item.id.startsWith("command:")) {
    return { source_table: "os_command_items", source_id: item.id.replace("command:", "") };
  }

  return { source_table: undefined, source_id: undefined };
}

function payloadFor(
  action: ChildWorkspaceActionPayload["action"],
  item: WorkspaceRecord,
  comment: string,
): ChildWorkspaceActionPayload {
  const source = sourceFromItem(item);
  return {
    action,
    item_type: item.type,
    item_id: item.id,
    source_table: source.source_table,
    source_id: source.source_id,
    title: item.title,
    summary: item.summary,
    comment,
    follow_up_action: action === "create_follow_up" || action === "request_changes" ? comment || item.action : item.action,
    priority: item.priority || "medium",
    metadata: {
      current_status: item.status,
      date: item.date,
      owner: item.owner,
      source_table: source.source_table,
      source_id: source.source_id,
    },
  };
}

const actions: Array<{
  action: ChildWorkspaceActionPayload["action"];
  label: string;
  tone: string;
  prompt?: string;
}> = [
  { action: "submit", label: "Submit", tone: "bg-slate-950 text-white" },
  { action: "mark_reviewed", label: "Mark reviewed", tone: "border border-slate-200 bg-white text-slate-700" },
  { action: "approve", label: "Approve", tone: "border border-emerald-200 bg-emerald-50 text-emerald-900" },
  { action: "sign_off", label: "Sign off", tone: "border border-blue-200 bg-blue-50 text-blue-900" },
  { action: "request_changes", label: "Request changes", tone: "border border-amber-200 bg-amber-50 text-amber-900", prompt: "What needs changing?" },
  { action: "create_follow_up", label: "Create follow-up", tone: "border border-purple-200 bg-purple-50 text-purple-900", prompt: "What follow-up action is needed?" },
];

export function ManagerActionButtons({
  childId,
  item,
  onStatus,
  onComplete,
}: {
  childId: string;
  item: WorkspaceRecord;
  onStatus: (message: string) => void;
  onComplete: () => Promise<void>;
}) {
  async function runAction(action: (typeof actions)[number]) {
    const source = sourceFromItem(item);
    const comment = action.prompt ? window.prompt(action.prompt, item.action || "") || "" : item.action || "";
    onStatus(source.source_table && source.source_id ? `${action.label} ${source.source_table} #${source.source_id}...` : `${action.label}...`);
    const result = await applyChildWorkspaceAction(childId, payloadFor(action.action, item, comment));
    if (result.ok && result.data?.ok !== false) {
      onStatus(`${action.label} complete. Refreshing from database...`);
      await onComplete();
      onStatus(`${action.label} complete.`);
      return;
    }
    onStatus(result.data?.message || `${action.label} failed (${result.status}).`);
  }

  if (item.id.startsWith("schema-")) return null;

  const source = sourceFromItem(item);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
        Manager workflow
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Move this item through review, approval, sign-off or create a follow-up action.
      </p>
      <div className="mt-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-slate-500">
        {source.source_table && source.source_id
          ? `Linked to ${source.source_table} #${source.source_id}`
          : "No exact source row yet. Save this item first, then refresh before applying a source-level action."}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.action}
            type="button"
            onClick={() => void runAction(action)}
            className={`rounded-2xl px-4 py-3 text-xs font-black ${action.tone}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
