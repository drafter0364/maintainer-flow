import type { Finding, RiskLevel } from "./types.js";
export type FailOnRisk = RiskLevel | "none";
export declare function highestRisk(findings: Finding[], fallback?: RiskLevel): RiskLevel;
export declare function isAtLeastRisk(actual: RiskLevel, threshold: RiskLevel): boolean;
export declare function riskRank(risk: RiskLevel): number;
export declare function parseFailOnRisk(value: string | undefined, fallback?: FailOnRisk): FailOnRisk;
