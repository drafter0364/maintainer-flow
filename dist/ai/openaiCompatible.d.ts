import type { AnalysisResult } from "../types.js";
export interface AgentSummaryOptions {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    context?: string;
    timeoutMs?: number;
    maxContextCharacters?: number;
}
export declare function createAgentSummary(result: AnalysisResult, options: AgentSummaryOptions): Promise<string | undefined>;
