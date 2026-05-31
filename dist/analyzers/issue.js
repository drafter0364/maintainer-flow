import { highestRisk } from "../risk.js";
const securityTerms = /\b(vulnerability|cve|exploit|xss|csrf|rce|secret|token leak|credential|bypass)\b/i;
const bugTerms = /\b(bug|crash|error|fail|broken|regression|exception|traceback)\b/i;
const featureTerms = /\b(feature|request|proposal|support|add|enhancement)\b/i;
const docsTerms = /\b(docs|documentation|readme|guide|typo|example)\b/i;
const questionTerms = /\b(question|how do i|how to|help|usage)\b/i;
export function analyzeIssue(input) {
    const body = input.body?.trim() ?? "";
    const searchable = `${input.title}\n${body}`;
    const labels = new Set((input.labels ?? []).map((label) => label.toLowerCase()));
    const findings = [];
    const suggestedLabels = inferLabels(searchable);
    if (securityTerms.test(searchable)) {
        findings.push({
            kind: "security",
            risk: "high",
            title: "Potential security report",
            details: "The issue text contains security-sensitive terms.",
            recommendation: "Avoid asking for exploit details in public. Point the reporter to SECURITY.md or private advisory intake."
        });
    }
    if (body.length < 80) {
        findings.push({
            kind: "triage",
            risk: "medium",
            title: "Issue body is too short for reliable triage",
            details: "The report may not include enough context for a maintainer or contributor to reproduce the problem.",
            recommendation: "Ask for environment details, expected behavior, actual behavior, and a minimal reproduction."
        });
    }
    if (bugTerms.test(searchable)) {
        const missing = missingBugSections(body);
        if (missing.length > 0) {
            findings.push({
                kind: "triage",
                risk: "medium",
                title: "Bug report is missing reproducibility details",
                details: `Missing likely sections: ${missing.join(", ")}.`,
                recommendation: "Request a minimal reproduction before spending maintainer time on diagnosis."
            });
        }
    }
    const absentLabels = suggestedLabels.filter((label) => !labels.has(label));
    if (absentLabels.length > 0) {
        findings.push({
            kind: "triage",
            risk: "low",
            title: "Suggested triage labels",
            details: `Suggested labels: ${absentLabels.join(", ")}.`,
            recommendation: "Apply labels only after a maintainer confirms the issue type."
        });
    }
    const risk = highestRisk(findings, "low");
    return {
        mode: "issue",
        risk,
        summary: risk === "high"
            ? "Treat this issue as potentially sensitive before public back-and-forth."
            : "Issue is ready for maintainer triage with the notes below.",
        findings,
        signals: [
            { label: "Body length", value: `${body.length} characters` },
            { label: "Existing labels", value: input.labels?.join(", ") || "none" },
            { label: "Suggested labels", value: suggestedLabels.join(", ") || "needs-triage" }
        ]
    };
}
function inferLabels(text) {
    const labels = [];
    if (securityTerms.test(text))
        labels.push("security");
    if (bugTerms.test(text))
        labels.push("bug");
    if (featureTerms.test(text))
        labels.push("enhancement");
    if (docsTerms.test(text))
        labels.push("documentation");
    if (questionTerms.test(text))
        labels.push("question");
    return labels.length > 0 ? labels : ["needs-triage"];
}
function missingBugSections(body) {
    const checks = [
        ["steps to reproduce", /(reproduce|steps|minimal|repo|sandbox)/i],
        ["expected behavior", /(expected|should)/i],
        ["actual behavior", /(actual|instead|got|happened)/i],
        ["environment", /(version|node|python|browser|os|environment|platform)/i]
    ];
    return checks.filter(([, pattern]) => !pattern.test(body)).map(([label]) => label);
}
//# sourceMappingURL=issue.js.map