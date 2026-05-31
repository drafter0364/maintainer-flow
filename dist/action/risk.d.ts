import type { Finding, RiskLevel } from "./types.js";
export declare function highestRisk(findings: Finding[], fallback?: RiskLevel): RiskLevel;
export declare function isAtLeastRisk(actual: RiskLevel, threshold: RiskLevel): boolean;
export declare function riskRank(risk: RiskLevel): number;
