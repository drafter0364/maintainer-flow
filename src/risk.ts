import type { Finding, RiskLevel } from "./types.js";

const weights: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3
};

export function highestRisk(findings: Finding[], fallback: RiskLevel = "low"): RiskLevel {
  return findings.reduce<RiskLevel>((current, finding) => {
    return weights[finding.risk] > weights[current] ? finding.risk : current;
  }, fallback);
}

export function isAtLeastRisk(actual: RiskLevel, threshold: RiskLevel): boolean {
  return weights[actual] >= weights[threshold];
}

export function riskRank(risk: RiskLevel): number {
  return weights[risk];
}
