export type RiskLevel = "low" | "medium" | "high";
export type FindingKind = "security" | "testing" | "release" | "documentation" | "dependency" | "ci" | "maintainability" | "triage";
export interface Finding {
    kind: FindingKind;
    risk: RiskLevel;
    title: string;
    details: string;
    recommendation: string;
}
export interface MaintainerSignal {
    label: string;
    value: string;
}
export interface AnalysisResult {
    mode: "pr" | "issue" | "release";
    risk: RiskLevel;
    summary: string;
    findings: Finding[];
    signals: MaintainerSignal[];
    agentSummary?: string;
}
export interface ChangedFile {
    path: string;
    additions: number;
    deletions: number;
    category: FileCategory;
}
export type FileCategory = "source" | "test" | "docs" | "ci" | "dependency" | "config" | "security" | "generated" | "other";
export interface DiffSummary {
    files: ChangedFile[];
    additions: number;
    deletions: number;
    categories: FileCategory[];
}
export interface PullRequestInput {
    title?: string;
    body?: string;
    diff: string;
}
export interface IssueInput {
    title: string;
    body?: string;
    labels?: string[];
}
export interface ReleaseInput {
    version?: string;
    notes?: string;
    diff?: string;
}
