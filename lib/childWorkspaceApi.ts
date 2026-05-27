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

export async function askChildWorkspaceOrb(childId: string, payload: ChildWorkspaceOrbPayload) {
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
