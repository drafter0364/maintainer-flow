export interface ActionEvent {
  pull_request?: {
    number?: number;
    title?: string;
    body?: string;
  };
  issue?: {
    number?: number;
    title?: string;
    body?: string;
    pull_request?: unknown;
    labels?: EventLabel[];
  };
  release?: {
    tag_name?: string;
    body?: string;
  };
}

export type EventLabel = string | { name?: string };
export type Mode = "auto" | "pr" | "issue" | "release";
export type SelectedMode = Exclude<Mode, "auto">;

export function selectMode(mode: Mode, event: ActionEvent): SelectedMode {
  if (mode !== "auto") return mode;
  if (event.pull_request) return "pr";
  if (event.issue && !event.issue.pull_request) return "issue";
  if (event.release) return "release";
  throw new Error("Maintainer Flow could not infer a mode from this event. Set mode to pr, issue, or release.");
}

export function labelsFromEvent(labels: EventLabel[] | undefined): string[] | undefined {
  return labels?.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean);
}
