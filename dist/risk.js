const weights = {
    low: 1,
    medium: 2,
    high: 3
};
export function highestRisk(findings, fallback = "low") {
    return findings.reduce((current, finding) => {
        return weights[finding.risk] > weights[current] ? finding.risk : current;
    }, fallback);
}
export function isAtLeastRisk(actual, threshold) {
    return weights[actual] >= weights[threshold];
}
export function riskRank(risk) {
    return weights[risk];
}
export function parseFailOnRisk(value, fallback = "none") {
    if (!value)
        return fallback;
    if (value === "none" || value === "low" || value === "medium" || value === "high")
        return value;
    throw new Error(`Invalid fail-on value "${value}". Expected one of: none, low, medium, high.`);
}
//# sourceMappingURL=risk.js.map