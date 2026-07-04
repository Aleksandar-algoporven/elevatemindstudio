"use server";

import { revalidatePath } from "next/cache";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.elevatemindstudio.net";

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const field = value(formData, key);
  return field.length ? field : null;
}

async function postJson(path: string, payload: Record<string, unknown>) {
  return sendJson(path, "POST", payload);
}

async function putJson(path: string, payload: Record<string, unknown>) {
  return sendJson(path, "PUT", payload);
}

async function sendJson(path: string, method: "POST" | "PUT", payload: Record<string, unknown>) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Workspace action failed: ${path}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function updateWorkspaceBrand(formData: FormData) {
  const prohibitedClaims = value(formData, "prohibited_claims")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  await putJson("/brands/active", {
    name: value(formData, "name"),
    domain: value(formData, "domain"),
    tone: value(formData, "tone"),
    autonomy_level: Number(value(formData, "autonomy_level") || "1"),
    prohibited_claims: prohibitedClaims
  });

  revalidatePath("/workspace");
}

export async function createWorkspaceSource(formData: FormData) {
  await postJson("/sources", {
    name: value(formData, "name"),
    source_type: value(formData, "source_type"),
    status: value(formData, "status") || "pending",
    url: optionalValue(formData, "url"),
    item_count: Number(value(formData, "item_count") || "0")
  });

  revalidatePath("/workspace");
}

export async function createWorkspaceDraft(formData: FormData) {
  const sourceRefs = value(formData, "source_refs")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await postJson("/drafts", {
    title: value(formData, "title"),
    pillar: value(formData, "pillar"),
    channel: value(formData, "channel"),
    risk_level: value(formData, "risk_level") || "low",
    source_refs: sourceRefs,
    copy_text: value(formData, "copy_text"),
    scheduled_for: optionalValue(formData, "scheduled_for")
  });

  revalidatePath("/workspace");
}

export async function generateWorkspaceDraft(formData: FormData) {
  await postJson("/drafts/generate/save", {
    brand_name: value(formData, "brand_name") || "AlgoProven",
    pillar: value(formData, "pillar"),
    channel: value(formData, "channel"),
    source_summary: value(formData, "source_summary"),
    goal: value(formData, "goal") || "Generate a review-ready social post."
  });

  revalidatePath("/workspace");
}

export async function reviewWorkspaceDraft(formData: FormData) {
  const draftId = value(formData, "draft_id");
  const decision = value(formData, "decision");

  await postJson(`/approvals/drafts/${draftId}`, {
    decision,
    reviewer: "Aleksandar",
    notes: `Workspace ${decision.replace("_", " ")} action`
  });

  revalidatePath("/workspace");
}

export async function scheduleWorkspaceDraft(formData: FormData) {
  await postJson(`/drafts/${value(formData, "draft_id")}/schedule`, {
    scheduled_for: value(formData, "scheduled_for")
  });

  revalidatePath("/workspace");
}

export async function queueWorkspaceDraft(formData: FormData) {
  await postJson(`/approvals/drafts/${value(formData, "draft_id")}/queue`, {});

  revalidatePath("/workspace");
}

export async function resolveWorkspaceInboxMessage(formData: FormData) {
  await postJson(`/inbox/${value(formData, "message_id")}/resolve`, {
    responder: "Aleksandar",
    notes: "Handled from workspace triage."
  });

  revalidatePath("/workspace");
}
