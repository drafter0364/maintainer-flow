import type { AnalysisResult, DiffSummary, FileCategory, PullRequestInput } from "../types.js";
export declare function parseUnifiedDiff(diff: string): DiffSummary;
export declare function classifyFile(path: string): FileCategory;
export declare function analyzePullRequest(input: PullRequestInput): AnalysisResult;
