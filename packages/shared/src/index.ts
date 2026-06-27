export type Channel =
  | "linkedin"
  | "x"
  | "instagram"
  | "youtube"
  | "discord"
  | "tiktok"
  | "reddit"
  | "bluesky"
  | "substack";

export type ApprovalState = "draft" | "needs_review" | "approved" | "scheduled" | "published" | "rejected";

export type RiskLevel = "low" | "medium" | "high";

export interface ContentDraft {
  id: string;
  title: string;
  pillar: string;
  channel: Channel;
  approvalState: ApprovalState;
  riskLevel: RiskLevel;
  scheduledFor?: string;
  sourceRefs: string[];
  copy: string;
}
