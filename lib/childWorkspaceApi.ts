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

async function optionalGet(path: string) {
  try {
    const response = await fetch(`${apiBase}${path}`, { credentials: "include" });
    if (!response.ok) return null;
    return parseJson(response);
  } catch {
    return null;
  }
}

function arrayFrom(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function tableForCompliance(type: string) {
  if (type === "support_plan_review") return "support_plans";
  if (type === "risk_review") return "risk_assessments";
  if (type === "keywork_follow_up") return "keywork_sessions";
  if (type === "statutory_document_review") return "statutory_documents";
  return "compliance_items";
}

function normaliseWorkspaceDocuments(data: any) {
  return arrayFrom(data, ["items", "documents", "data"]).map((item: any) => ({
    ...item,
    type: item?.type || item?.document_type || item?.group || "Document",
    title: item?.title || item?.name || item?.document_name || "Document",
    summary: item?.summary || item?.description || item?.review_summary || item?.status || "Document record",
    status: item?.status || item?.workflow_status || "open",
    source_table: item?.source_table || "child_documents",
    source_id: item?.source_id || item?.id,
    recommended_action: item?.recommended_action || item?.next_review_action || item?.review_status,
    occurred_at: item?.updated_at || item?.created_at || item?.review_due_date || item?.next_review_due,
  }));
}

function normaliseWorkspacePlans(data: any) {
  return arrayFrom(data, ["items", "plans", "data"]).map((item: any) => ({
    ...item,
    type: item?.plan_type || "Plan",
    title: item?.title || item?.plan_title || "Support plan",
    summary: item?.summary || item?.presenting_need || item?.staff_guidance || item?.status || "Support plan",
    status: item?.approval_status || item?.workflow_status || item?.status || "open",
    source_table: item?.source_table || "support_plans",
    source_id: item?.source_id || item?.id,
    recommended_action: item?.recommended_action || item?.review_note || item?.review_date,
    occurred_at: item?.updated_at || item?.created_at || item?.review_date || item?.start_date,
  }));
}

function normaliseWorkspaceCompliance(data: any) {
  return arrayFrom(data, ["compliance_items", "items", "data"]).map((item: any) => {
    const complianceType = String(item?.compliance_type || "compliance");
    return {
      ...item,
      type: "Compliance",
      title: item?.title || complianceType.replaceAll("_", " "),
      summary: `${item?.compliance_status || "ok"}${item?.due_date ? ` · due ${item.due_date}` : ""}`,
      status: item?.compliance_status || item?.status || "ok",
      priority: item?.compliance_status === "overdue" ? "high" : item?.compliance_status === "due_soon" ? "medium" : "normal",
      source_table: item?.source_table || tableForCompliance(complianceType),
      source_id: item?.source_id || item?.id,
      recommended_action: item?.compliance_status === "overdue" ? "Review this overdue item now." : item?.compliance_status === "due_soon" ? "Plan this review before it becomes overdue." : "Keep under routine review.",
      occurred_at: item?.due_date || item?.created_at,
    };
  });
}

function normaliseWorkspaceStandards(summary: any, evidence: any) {
  const summaryItems = arrayFrom(summary, ["items", "standards", "data"]).map((item: any) => ({
    ...item,
    type: "Quality Standard",
    title: item?.short_label || item?.title || item?.code || "Quality Standard",
    summary: `${item?.linked_record_count || 0} linked evidence record(s)`,
    status: Number(item?.linked_record_count || 0) > 0 ? "evidenced" : "gap",
    priority: Number(item?.linked_record_count || 0) > 0 ? "normal" : "medium",
    source_table: "quality_standards",
    source_id: item?.code,
    recommended_action: Number(item?.linked_record_count || 0) > 0 ? "Open evidence links to review strength." : "ORB should identify evidence or record this as an evidence gap.",
    occurred_at: item?.updated_at || item?.created_at,
  }));

  const evidenceItems = arrayFrom(evidence, ["items", "evidence", "data"]).map((item: any) => ({
    ...item,
    type: "Standard evidence",
    title: item?.standard_short_label || item?.standard_title || item?.standard_code || "Standard evidence",
    summary: item?.rationale || item?.evidence_strength || "Linked evidence record",
    status: item?.evidence_strength || "linked",
    priority: item?.evidence_strength === "primary" ? "normal" : "low",
    source_table: item?.source_table || "record_standard_links",
    source_id: item?.source_id || item?.id,
    recommended_action: "Open the source record and check the evidence strength.",
    occurred_at: item?.created_at || item?.updated_at,
  }));

  return [...summaryItems, ...evidenceItems];
}

function normaliseWorkspaceReports(data: any) {
  return arrayFrom(data, ["reports", "items", "data"]).map((item: any) => ({
    ...item,
    type: item?.report_type || "Report",
    title: item?.title || "Young person report",
    summary: item?.report_text || item?.summary || "Generated report",
    status: item?.status || "generated",
    source_table: item?.source_table || "ai_generated_reports",
    source_id: item?.source_id || item?.id,
    recommended_action: "Open, review and export if needed.",
    occurred_at: item?.updated_at || item?.created_at || item?.review_month,
  }));
}

function normaliseWorkspaceCalendar(data: any) {
  const items = arrayFrom(data, ["items", "calendar", "days", "data"]);
  if (!items.length && data?.summary) {
    return [{
      type: "Calendar",
      title: "Calendar summary",
      summary: JSON.stringify(data.summary),
      status: "summary",
      source_table: "calendar_summary",
      source_id: "current_month",
      recommended_action: "Open records by date to inspect the child journey.",
    }];
  }
  return items.map((item: any, index: number) => ({
    ...item,
    id: item?.id || `calendar-${index}`,
    type: item?.type || item?.record_type || "Calendar",
    title: item?.title || item?.date || "Calendar item",
    summary: item?.summary || item?.count || item?.description || "Calendar record",
    status: item?.status || "open",
    source_table: item?.source_table || "calendar_summary",
    source_id: item?.source_id || item?.id || item?.date || index,
    recommended_action: item?.recommended_action || "Open the linked date or record.",
    occurred_at: item?.date || item?.occurred_at || item?.created_at,
  }));
}

function mergeExistingSources(base: any, docs: any, plans: any, sources: any, compliance: any, standards: any, standardsEvidence: any, reports: any, calendar: any) {
  return {
    ...base,
    documents: normaliseWorkspaceDocuments(docs),
    plans: normaliseWorkspacePlans(plans),
    compliance: normaliseWorkspaceCompliance(compliance),
    standards: normaliseWorkspaceStandards(standards, standardsEvidence),
    reports: normaliseWorkspaceReports(reports),
    calendar: normaliseWorkspaceCalendar(calendar),
    workspace_sources: {
      ...(base?.workspace_sources || {}),
      ...(sources?.sources || {}),
    },
  };
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
    ...evidenceItems.map((item: any, index: number) => ({ id: item?.id || `evidence-${index}`, type: item?.source_type || "ORB evidence", title: item?.label || item?.title || "Evidence", summary: item?.basis || item?.excerpt || item?.route || "Evidence used by operational ORB.", status: item?.severity || "info", priority: item?.severity || "normal", evidence: item?.route || item?.source_type, action: item?.basis })),
    ...sources.map((item: any, index: number) => ({ id: item?.route || `source-${index}`, type: item?.source_type || "ORB source", title: item?.label || "Source", summary: item?.excerpt || item?.basis || "Permissioned source used by operational ORB.", status: "source", priority: "normal", evidence: item?.route || item?.source_type, action: item?.basis })),
    ...contextCards.map((item: any, index: number) => ({ id: item?.id || `context-${index}`, type: item?.type || "Context card", title: item?.title || "Context", summary: item?.summary || "Context card from operational ORB.", status: item?.severity || "info", priority: item?.severity || "normal", evidence: item?.route_hint || item?.source_label, action: item?.summary })),
    ...recommendations.map((item: any, index: number) => ({ id: item?.id || `recommendation-${index}`, type: "Recommendation", title: item?.title || "Recommendation", summary: item?.summary || item?.rationale || "Recommended action from operational ORB.", status: item?.priority || "medium", priority: item?.priority || "medium", evidence: Array.isArray(item?.source_labels) ? item.source_labels.join(", ") : item?.route_hint, action: item?.suggested_action })),
    ...reviewPrompts.map((item: any, index: number) => ({ id: item?.id || `review-${index}`, type: "Review prompt", title: item?.title || "Review prompt", summary: item?.reason || "Operational review prompt.", status: item?.priority || "medium", priority: item?.priority || "medium", evidence: item?.route_hint, action: item?.reason })),
  ];

  return { ok: true, answer: inner?.answer || inner?.briefing?.summary || "ORB has reviewed the permissioned operational context.", evidence, operational_orb: true, raw: inner };
}

export async function getChildWorkspace(childId: string, signal?: AbortSignal) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace`, { credentials: "include", signal });

  if (!response.ok) return { ok: false, status: response.status, data: await parseJson(response) };

  const base = await parseJson(response);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const [sources, docs, plans, compliance, standards, standardsEvidence, reports, calendar] = await Promise.all([
    optionalGet(`/api/os-command/young-person/${childId}/workspace/sources`),
    optionalGet(`/child-documents?young_person_id=${encodeURIComponent(childId)}&limit=100`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/plans`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/compliance`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/standards`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/standards/evidence`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/reports`),
    optionalGet(`/young-people/${encodeURIComponent(childId)}/calendar-summary?year=${year}&month=${month}`),
  ]);

  return { ok: true, status: response.status, data: mergeExistingSources(base, docs, plans, sources, compliance, standards, standardsEvidence, reports, calendar) };
}

export async function saveChildWorkspaceItem(childId: string, item: ChildWorkspaceItemPayload) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/items`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}

export async function applyChildWorkspaceAction(childId: string, payload: ChildWorkspaceActionPayload) {
  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/action`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}

export async function askChildWorkspaceOrb(childId: string, payload: ChildWorkspaceOrbPayload) {
  const operationalResponse = await fetch(`${apiBase}/api/assistant/orb/conversation`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
      high_level_flags: [payload.context?.sourceTable ? `source_table:${String(payload.context.sourceTable)}` : "child_workspace", payload.context?.sourceId ? `source_id:${String(payload.context.sourceId)}` : "workspace_orb"],
    }),
  });

  const operationalData = await parseJson(operationalResponse);
  if (operationalResponse.ok && operationalData?.success !== false) return { ok: true, status: operationalResponse.status, data: normaliseOperationalOrbData(operationalData) };

  const response = await fetch(`${apiBase}/api/os-command/young-person/${childId}/workspace/orb`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return { ok: response.ok, status: response.status, data: await parseJson(response) };
}