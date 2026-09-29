// ────────────────────────────────────────────────────────────────────────────────
// Shared types for Krimsona AI Dashboard
// ────────────────────────────────────────────────────────────────────────────────

export interface TaskProof {
  description: string;
  isDevelopment: boolean;
  commitId: string;
  commitMessage: string;
  branch: string;
  repoLink: string;
  attachmentName?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  duration: string;
  notes: string[];
  status: "In Progress" | "Completed";
  proof?: TaskProof;
}

export type VoiceContext =
  | "IDLE"
  | "AWAITING_TITLE"
  | "AWAITING_PLAN"
  | "AWAITING_NOTE"
  | "AWAITING_SUMMARY"
  | "AWAITING_COMMIT";

export type TabName = "dashboard" | "timeline" | "memory_lane" | "exports";

export const WAKE_WORD = "krimsona";

export const EMPTY_PROOF: TaskProof = {
  description: "",
  isDevelopment: false,
  commitId: "",
  commitMessage: "",
  branch: "",
  repoLink: "",
};
