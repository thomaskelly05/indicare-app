export type ChildWorkspaceItemPayload = {
  item_id?: string;
  item_type: string;
  title: string;
  summary?: string;
  status?: string;
  priority?: string;
  evidence?: string;
  action?: string;
  owner?: string;
  payload?: Record<string, unknown>;
};

export type ChildWorkspaceOrbPayload = {
  question: string;
  draft_text?: string;
  context?: Record<string, unknown>;
};

export type ChildWorkspaceActionPayload = {
  action:
    | "submit"
    | "request_changes"
    | "approve"
    | "sign_off"
    | "mark_reviewed"
    | "create_follow_up"
    | "resolve_action";
  item_type?: string;
  item_id?: string;
  source_table?: string;
  source_id?: string | number;
  title?: string;
  summary?: string;
  comment?: string;
  follow_up_action?: string;
  priority?: string;
  metadata?: Record<string, unknown>;
};

type OperationalOrbMode =
  | "operational_summary"
  | "manager_daily_brief"
  | "record_quality_review"
  | "recording_live_coach"
  | "safeguarding_themes"
  | "ofsted_evidence_review"
  | "action_priority"
  | "staff_support"
  | "child_journey_summary"
  | "governance_briefing"
  | "general_operational_question"
  | "chronology_story_review"
  | "archive_summary"
  | "lifeecho_memory_support"
  | "plan_impact_review"
  | "document_target_extraction";

const apiBase = process.env.NEXT_PUBLIC_INDICARE_API_BASE || "";

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function modeForWorkspaceQuestion(question: string, context?: Record<string, unknown>): OperationalOrbMode {
  const value = `${question} ${String(context?.type || "")} ${String(context?.item_type || "")}`.toLowerCase();
  if (value.includes("ofsted") || value.includes("inspector") || value.includes("sccif")) return "ofsted_evidence_review";
  if (value.includes("therapeutic") || value.includes("rewrite") || value.includes("wording") || value.includes("record")) return "recording_live_coach";
  if (value.includes("manager") || value.includes("review") || value.includes("sign") || value.includes("approve")) return "record_quality_review";
  if (value.includes("safeguard") || value.includes("risk") || value.includes("missing") || value.includes("incident")) return "safeguarding_themes";
  if (value.includes("journey") || value.includes("chronology") || value.includes("story") || value.includes("lifeecho")) return "child_journey_summary";
  if (value.includes("action") || value.includes("what needs") || value.includes("priority")) return "action_priority";
  if (value.includes("plan") || value.includes("impact")) return "plan_impact_review";
  if (value.includes("document")) return "document_target_extraction";
  return "general_operational_question";
}

function normaliseOperationalOrbData(data: any) {
  const inner = data?.data || data;
  const evidenceItems = Array.isArray(inner?.evidence_items) ? inner.evidence_items : [];
  const sources = Array.isArray(inner?.sources) ? inner.sources : [];
  const contextCards = Array.isArray(inner?.context_cards) ? inner.context_cards : [];
  const recommendations = Array.isArray(inner?.recommendations) ? inner.recommendations : [];
  const reviewPrompts = Array.isArray(inner?.review_prompts) ? inner.review_prompts : [];

  const evidence = [
    ...evidenceItems.map((item: any, index: number) => ({
      id: item?.id || `evidence-${index}`,
      type: item?.source_type || "ORB evidence",
      title: item?.label || item?.title || "Evidence",
      summary: item?.basis || item?.excerpt || item?.route || "Evidence used by operational ORB.",
      status: item?.severity || "info",
      priority: item?.severity || "normal",
      evidence: item?.route || item?.source_type,
      action: item?.basis,
    })),
    ...sources.map((item: any, index: number) => ({
      id: item?.route || `source-${index}`,
      type: item?.source_type || "ORB source",
      title: item?.label || "Source",
      summary: item?.excerpt || item?.basis || "Permissioned source used by operational ORB.",
      status: "source",
      priority: "normal",
      evidence: item?.route || item?.source_type,
      action: item?.basis,
    })),
    ...contextCards.map((item: any, index: number) => ({
      id: item?.id || `context-${index}`,
      type: item?.type || "Context card",
      title: item?.title || "Context",
      summary: item?.summary || "Context card from operational ORB.",
      status: item?.severity || "info",
      priority: item?.severity || "normal",
      evidence: item?.route_hint || item?.source_label,
      action: item?.summary,
    })),
    ...recommendations.map((item: any, index: number) => ({
      id: item?.id || `recommendation-${index}`,
      type: "Recommendation",
      title: item?.title || "Recommendation",
      summary: item?.summary || item?.rationale || "Recommended action from operational ORB.",
      status: item?.priority || "medium",
      priority: item?.priority || "medium",
      evidence: Array.isArray(item?.source_labels) ? item.source_labels.join(", ") : item?.route_hint,
      action: item?.suggested_action,
    })),
    ...reviewPrompts.map((item: any, index: number) => ({
      id: item?.id || `review-${index}`,
      type: "Review prompt",
      title: item?.title || "Review prompt",
      summary: item?.reason || "Operational review prompt.",
      status: item?.priority || "medium",
      priority: item?.priority || "medium",
      evidence: item?.route_hint,
      action: item?.reason,
    })),
  ];

  return {
    ok: true,
    answer: inner?.answer || inner?.briefing?.summary || "ORB has reviewed the permissioned operational context.",
    evidence,
    operational_orb: true,
    raw: inner,
  };
}

export async function getChildWorkspace(childId: string, signal?: AbortSignal) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    return { ok: false, status: response.status, data: await parseJson(response) };
  }

  return { ok: true, status: response.status, data: await parseJson(response) };
}

export async function saveChildWorkspaceItem(childId: string, item: ChildWorkspaceItemPayload) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/items`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}

export async function applyChildWorkspaceAction(childId: string, payload: ChildWorkspaceActionPayload) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/action`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}

export async function askChildWorkspaceOrb(childId: string, payload: ChildWorkspaceOrbPayload) {
  const operationalResponse = await fetch(`${apiBase}/api/assistant/orb/conversation`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: payload.question,
      mode: modeForWorkspaceQuestion(payload.question, payload.context),
      scope: "child",
      child_id: Number(childId),
      days: 30,
      include_actions: true,
      include_record_quality: true,
      include_patterns: true,
      require_manager_review: Boolean(payload.context?.require_manager_review),
      selected_excerpt: payload.draft_text || String(payload.context?.summary || ""),
      recording_type: String(payload.context?.type || payload.context?.item_type || ""),
      high_level_flags: [
        payload.context?.sourceTable ? `source_table:${String(payload.context.sourceTable)}` : "child_workspace",
        payload.context?.sourceId ? `source_id:${String(payload.context.sourceId)}` : "workspace_orb",
      ],
    }),
  });

  const operationalData = await parseJson(operationalResponse);
  if (operationalResponse.ok && operationalData?.success !== false) {
    return { ok: true, status: operationalResponse.status, data: normaliseOperationalOrbData(operationalData) };
  }

  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/orb`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}
