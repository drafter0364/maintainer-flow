import { highestRisk } from "../risk.js";
const dependencyFiles = new Set([
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
    "requirements.txt",
    "poetry.lock",
    "pyproject.toml",
    "Cargo.toml",
    "Cargo.lock",
    "go.mod",
    "go.sum",
    "Gemfile",
    "Gemfile.lock"
]);
const generatedPathPattern = /(^|\/)(dist|build|vendor|generated|coverage)\//i;
const testPathPattern = /(^|\/)(__tests__|tests?|spec)\//i;
const testFilePattern = /(\.|-)(test|spec)\.[cm]?[jt]sx?$|_test\.(go|py)$/i;
const docsPathPattern = /(^|\/)(docs?|website)\//i;
const docsFilePattern = /(^|\/)(readme|changelog|contributing|security|code_of_conduct|license)(\..*)?$/i;
const ciPathPattern = /(^|\/)(\.github\/workflows|\.gitlab-ci\.yml|azure-pipelines\.yml|circle\.yml)/i;
const securityPathPattern = /(^|\/)(auth|oauth|crypto|security|permissions?|secrets?)($|\/|\.)/i;
export function parseUnifiedDiff(diff) {
    const files = [];
    let current;
    for (const line of diff.split(/\r?\n/)) {
        const fileMatch = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
        if (fileMatch) {
            current = {
                path: fileMatch[2] ?? fileMatch[1] ?? "unknown",
                additions: 0,
                deletions: 0,
                category: classifyFile(fileMatch[2] ?? fileMatch[1] ?? "unknown")
            };
            files.push(current);
            continue;
        }
        if (!current) {
            const newFileMatch = /^\+\+\+ b\/(.+)$/.exec(line);
            if (newFileMatch) {
                current = {
                    path: newFileMatch[1] ?? "unknown",
                    additions: 0,
                    deletions: 0,
                    category: classifyFile(newFileMatch[1] ?? "unknown")
                };
                files.push(current);
            }
            continue;
        }
        if (line.startsWith("+++") || line.startsWith("---")) {
            continue;
        }
        if (line.startsWith("+")) {
            current.additions += 1;
        }
        else if (line.startsWith("-")) {
            current.deletions += 1;
        }
    }
    const additions = files.reduce((sum, file) => sum + file.additions, 0);
    const deletions = files.reduce((sum, file) => sum + file.deletions, 0);
    const categories = [...new Set(files.map((file) => file.category))];
    return { files, additions, deletions, categories };
}
export function classifyFile(path) {
    const normalized = path.replace(/\\/g, "/").toLowerCase();
    const basename = normalized.split("/").at(-1) ?? normalized;
    if (generatedPathPattern.test(normalized))
        return "generated";
    if (ciPathPattern.test(normalized))
        return "ci";
    if (securityPathPattern.test(normalized))
        return "security";
    if (dependencyFiles.has(basename))
        return "dependency";
    if (testPathPattern.test(normalized) || testFilePattern.test(normalized))
        return "test";
    if (docsPathPattern.test(normalized) || docsFilePattern.test(normalized))
        return "docs";
    if (/\.(json|ya?ml|toml|ini|conf|config\.[cm]?[jt]s)$/i.test(normalized))
        return "config";
    if (/\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|cpp|c|h)$/i.test(normalized))
        return "source";
    return "other";
}
export function analyzePullRequest(input) {
    const diffSummary = parseUnifiedDiff(input.diff);
    const findings = [];
    const categories = new Set(diffSummary.categories);
    const changedLines = diffSummary.additions + diffSummary.deletions;
    const sourceChanged = categories.has("source") || categories.has("security");
    const testsChanged = categories.has("test");
    const docsOnly = diffSummary.files.length > 0 &&
        diffSummary.files.every((file) => file.category === "docs" || file.category === "generated");
    if (diffSummary.files.length === 0) {
        findings.push({
            kind: "maintainability",
            risk: "medium",
            title: "No diff was available",
            details: "Maintainer Flow could not inspect changed files, so the report cannot estimate test or release risk.",
            recommendation: "Pass a unified diff with --diff or configure the GitHub token so the action can fetch pull request diffs."
        });
    }
    if (categories.has("security")) {
        findings.push({
            kind: "security",
            risk: "high",
            title: "Security-sensitive paths changed",
            details: "The pull request touches authentication, permission, secret, or cryptography-related files.",
            recommendation: "Require a maintainer with security context to review this change before merging."
        });
    }
    if (categories.has("ci")) {
        findings.push({
            kind: "ci",
            risk: "high",
            title: "CI or workflow configuration changed",
            details: "Workflow changes can alter what code runs with repository credentials.",
            recommendation: "Review permissions, third-party actions, pinning strategy, and fork behavior before trusting this workflow."
        });
    }
    if (categories.has("dependency")) {
        findings.push({
            kind: "dependency",
            risk: "medium",
            title: "Dependency manifests changed",
            details: "Dependency or lockfile updates can introduce supply-chain and compatibility risk.",
            recommendation: "Run dependency review, vulnerability scanning, and release notes checks for new or upgraded packages."
        });
    }
    if (sourceChanged && !testsChanged) {
        findings.push({
            kind: "testing",
            risk: "medium",
            title: "Source changed without tests",
            details: "The diff changes runtime code but does not include test files.",
            recommendation: "Ask for targeted tests or explain why existing coverage is sufficient."
        });
    }
    if (changedLines > 800) {
        findings.push({
            kind: "maintainability",
            risk: "medium",
            title: "Large change set",
            details: `The pull request changes ${changedLines} lines across ${diffSummary.files.length} files.`,
            recommendation: "Consider splitting mechanical changes from behavior changes to make review safer."
        });
    }
    if (docsOnly) {
        findings.push({
            kind: "documentation",
            risk: "low",
            title: "Documentation-focused change",
            details: "The changed files are limited to documentation or generated artifacts.",
            recommendation: "Review for clarity, correctness, and links rather than requiring a full runtime test cycle."
        });
    }
    const risk = highestRisk(findings, "low");
    const summary = risk === "high"
        ? "High attention required before merge."
        : risk === "medium"
            ? "Review is safe to start, but maintainers should resolve the flagged checks."
            : "Low-risk change based on the available diff.";
    return {
        mode: "pr",
        risk,
        summary,
        findings,
        signals: [
            { label: "Files changed", value: String(diffSummary.files.length) },
            { label: "Additions", value: String(diffSummary.additions) },
            { label: "Deletions", value: String(diffSummary.deletions) },
            { label: "Categories", value: diffSummary.categories.join(", ") || "none" }
        ]
    };
}
//# sourceMappingURL=diff.js.map