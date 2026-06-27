import type { ContentDraft } from "@elevatemindstudio/shared";

export const overview = {
  brand: "AlgoProven",
  domain: "elevatemindstudio.net",
  mode: "Approval required",
  connectedSources: 4,
  connectedChannels: 5,
  draftsInReview: 8,
  scheduledPosts: 12,
  inboxItems: 17,
  riskFlags: 3
};

export const drafts: ContentDraft[] = [
  {
    id: "draft-001",
    title: "Product truth from changelog",
    pillar: "Product truth",
    channel: "linkedin",
    approvalState: "needs_review",
    riskLevel: "medium",
    scheduledFor: "2026-06-30T09:00:00Z",
    sourceRefs: ["AlgoProven app changelog", "Risk system notes"],
    copy: "A useful product update is not a slogan. It is a traceable change users can inspect, test, and trust."
  },
  {
    id: "draft-002",
    title: "Founder build-in-public thread",
    pillar: "Founder/operator voice",
    channel: "x",
    approvalState: "draft",
    riskLevel: "low",
    scheduledFor: "2026-06-30T14:30:00Z",
    sourceRefs: ["Founder notes", "Roadmap v1"],
    copy: "Building trading infrastructure teaches the same lesson every week: the boring controls are what keep the exciting parts alive."
  },
  {
    id: "draft-003",
    title: "Short-form risk systems reel",
    pillar: "Trust and rigor",
    channel: "instagram",
    approvalState: "approved",
    riskLevel: "medium",
    scheduledFor: "2026-07-01T12:00:00Z",
    sourceRefs: ["Risk manager docs", "Dashboard screenshots"],
    copy: "Three checks that should happen before any strategy gets near real users: exposure, limits, and kill switch behavior."
  }
];

export const sourceHealth = [
  { name: "Website crawl", status: "ready", count: "12 pages" },
  { name: "GitHub releases", status: "ready", count: "3 repos" },
  { name: "Founder notes", status: "manual", count: "6 notes" },
  { name: "Analytics loop", status: "pending", count: "GA4 setup" }
];

export const calendar = [
  { day: "Mon", posts: 3, focus: "Product truth" },
  { day: "Tue", posts: 2, focus: "Founder voice" },
  { day: "Wed", posts: 4, focus: "Education" },
  { day: "Thu", posts: 2, focus: "Trust" },
  { day: "Fri", posts: 1, focus: "Recap" }
];
