#!/usr/bin/env node
import { analyzePullRequest } from "./analyzers/diff.js";
import { analyzeIssue } from "./analyzers/issue.js";
import { analyzeRelease } from "./analyzers/release.js";
import { createAgentSummary } from "./ai/openaiCompatible.js";
import { readJsonFile, readTextFile, writeTextFile } from "./io.js";
import { resultToMarkdown } from "./report.js";
import { isAtLeastRisk } from "./risk.js";
async function main() {
    const [command, ...rest] = process.argv.slice(2);
    if (!command || command === "help" || command === "--help" || command === "-h") {
        printHelp();
        return;
    }
    const flags = parseFlags(rest);
    let result;
    if (command === "pr") {
        result = analyzePullRequest({
            title: stringFlag(flags, "title"),
            body: readOptionalText(flags, "body-file") ?? stringFlag(flags, "body"),
            diff: readRequiredText(flags, "diff", "Pull request analysis requires --diff <path>.")
        });
    }
    else if (command === "issue") {
        const event = readOptionalEvent(flags);
        const issue = event?.issue;
        result = analyzeIssue({
            title: stringFlag(flags, "title") ?? issue?.title ?? "Untitled issue",
            body: readOptionalText(flags, "body-file") ?? stringFlag(flags, "body") ?? issue?.body ?? "",
            labels: labelsFromFlags(flags) ?? labelsFromEvent(issue?.labels)
        });
    }
    else if (command === "release") {
        const event = readOptionalEvent(flags);
        result = analyzeRelease({
            version: stringFlag(flags, "version") ?? event?.release?.tag_name,
            notes: readOptionalText(flags, "notes-file") ?? stringFlag(flags, "notes") ?? event?.release?.body ?? "",
            diff: readOptionalText(flags, "diff")
        });
    }
    else {
        throw new Error(`Unknown command: ${command}`);
    }
    const agentSummary = await createAgentSummary(result, {
        apiKey: stringFlag(flags, "openai-api-key") ?? process.env.OPENAI_API_KEY,
        baseUrl: stringFlag(flags, "openai-base-url") ?? process.env.OPENAI_BASE_URL,
        model: stringFlag(flags, "openai-model") ?? process.env.OPENAI_MODEL,
        context: buildContext(flags)
    });
    if (agentSummary) {
        result.agentSummary = agentSummary;
    }
    const output = flags.json || flags.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : resultToMarkdown(result);
    const outputPath = stringFlag(flags, "output");
    if (outputPath) {
        writeTextFile(outputPath, output);
    }
    else {
        process.stdout.write(output);
    }
    const failOn = stringFlag(flags, "fail-on");
    if (failOn && failOn !== "none" && isRiskLevel(failOn) && isAtLeastRisk(result.risk, failOn)) {
        process.exitCode = 1;
    }
}
function parseFlags(args) {
    const flags = {};
    for (let index = 0; index < args.length; index += 1) {
        const token = args[index];
        if (!token?.startsWith("--"))
            continue;
        const key = token.slice(2);
        const next = args[index + 1];
        if (!next || next.startsWith("--")) {
            flags[key] = true;
        }
        else {
            flags[key] = next;
            index += 1;
        }
    }
    return flags;
}
function readRequiredText(flags, key, message) {
    const value = stringFlag(flags, key);
    if (!value)
        throw new Error(message);
    return readTextFile(value);
}
function readOptionalText(flags, key) {
    const value = stringFlag(flags, key);
    return value ? readTextFile(value) : undefined;
}
function readOptionalEvent(flags) {
    const path = stringFlag(flags, "event");
    return path ? readJsonFile(path) : undefined;
}
function labelsFromFlags(flags) {
    const labels = stringFlag(flags, "labels");
    return labels
        ?.split(",")
        .map((label) => label.trim())
        .filter(Boolean);
}
function labelsFromEvent(labels) {
    return labels?.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean);
}
function buildContext(flags) {
    const contextPath = stringFlag(flags, "context");
    return contextPath ? readTextFile(contextPath) : "";
}
function stringFlag(flags, key) {
    const value = flags[key];
    return typeof value === "string" ? value : undefined;
}
function isRiskLevel(value) {
    return value === "low" || value === "medium" || value === "high";
}
function printHelp() {
    process.stdout.write(`Maintainer Flow

Usage:
  maintainer-flow pr --diff pr.diff [--title "..."] [--body-file body.md]
  maintainer-flow issue --title "Bug title" --body-file issue.md [--labels bug,needs-triage]
  maintainer-flow issue --event event.json
  maintainer-flow release --version v1.2.3 --notes-file RELEASE.md [--diff changes.diff]

Options:
  --format json             Print JSON instead of Markdown.
  --json                    Alias for --format json.
  --output <path>           Write report to a file.
  --fail-on <risk>          Exit 1 when risk is at least low, medium, or high.
  --openai-api-key <key>    Enable OpenAI-compatible agent summary.
  --openai-base-url <url>   Override API base URL.
  --openai-model <model>    Override model.
`);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`maintainer-flow: ${message}\n`);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map