const riskPrefix = {
    low: "[LOW]",
    medium: "[MEDIUM]",
    high: "[HIGH]"
};
export function resultToMarkdown(result) {
    const lines = [
        "## Maintainer Flow report",
        "",
        `${riskPrefix[result.risk]} **Overall risk:** ${result.risk.toUpperCase()}`,
        "",
        result.summary,
        ""
    ];
    if (result.agentSummary) {
        lines.push("### Agent summary", "", result.agentSummary.trim(), "");
    }
    lines.push("### Signals", "");
    for (const signal of result.signals) {
        lines.push(`- **${signal.label}:** ${signal.value}`);
    }
    lines.push("", "### Findings", "");
    if (result.findings.length === 0) {
        lines.push("- No findings from the enabled checks.");
    }
    else {
        for (const finding of result.findings) {
            lines.push(formatFinding(finding));
        }
    }
    lines.push("", "### Maintainer note", "", "This report is advisory. Maintainers should treat issue text, pull request content, and generated summaries as untrusted input.");
    return `${lines.join("\n")}\n`;
}
function formatFinding(finding) {
    return [
        `- **[${finding.risk.toUpperCase()}] ${finding.title}**`,
        `  ${finding.details}`,
        `  Recommendation: ${finding.recommendation}`
    ].join("\n");
}
//# sourceMappingURL=report.js.map