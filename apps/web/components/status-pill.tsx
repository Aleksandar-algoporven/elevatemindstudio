import type { ApprovalState, RiskLevel } from "@elevatemindstudio/shared";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: ApprovalState | RiskLevel | "ready" | "manual" | "pending";
};

export function StatusPill({ children, tone = "draft" }: StatusPillProps) {
  return <span className={`statusPill tone-${tone.replace("_", "-")}`}>{children}</span>;
}
