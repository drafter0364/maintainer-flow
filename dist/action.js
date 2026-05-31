import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { analyzePullRequest } from "./analyzers/diff.js";
import { analyzeIssue } from "./analyzers/issue.js";
import { analyzeRelease } from "./analyzers/release.js";
import { createAgentSummary } from "./ai/openaiCompatible.js";
import { readJsonFile, readTextFile, writeTextFile } from "./io.js";
import { resultToMarkdown } from "./report.js";
import { isAtLeastRisk, parseFailOnRisk } from "./risk.js";
const markerPrefix = "<!-- maintainer-flow:";
async function run() {
    const mode = getMode();
    const event = readEvent();
    const token = core.getInput("github-token");
    const diffPath = core.getInput("diff-path");
    const selectedMode = selectMode(mode, event);
    let result;
    if (selectedMode === "pr") {
        const diff = diffPath ? readTextFile(diffPath) : await fetchPullRequestDiff(token, event);
        result = analyzePullRequest({
            title: event.pull_request?.title,
            body: event.pull_request?.body,
            diff
        });
    }
    else if (selectedMode === "issue") {
        result = analyzeIssue({
            title: event.issue?.title ?? "Untitled issue",
            body: event.issue?.body ?? "",
            labels: labelsFromEvent(event.issue?.labels)
        });
    }
    else {
        const diff = diffPath ? readTextFile(diffPath) : readGitDiff();
        result = analyzeRelease({
            version: event.release?.tag_name,
            notes: event.release?.body,
            diff
        });
    }
    const agentSummary = await maybeAgentSummary(result, diffPath);
    if (agentSummary) {
        result.agentSummary = agentSummary;
    }
    const report = resultToMarkdown(result);
    const reportPath = core.getInput("report-path") || "maintainer-flow-report.md";
    writeTextFile(reportPath, report);
    await core.summary.addRaw(report).write();
    core.setOutput("risk", result.risk);
    core.setOutput("summary", result.summary);
    core.setOutput("report-path", reportPath);
    if (core.getBooleanInput("comment")) {
        try {
            await upsertComment(token, selectedMode, event, report);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            core.warning(`Comment skipped: ${message}`);
        }
    }
    const failOn = parseFailOnRisk(core.getInput("fail-on"), "none");
    if (failOn !== "none" && isAtLeastRisk(result.risk, failOn)) {
        core.setFailed(`Maintainer Flow risk ${result.risk} meets fail-on threshold ${failOn}.`);
    }
}
function getMode() {
    const mode = core.getInput("mode") || "auto";
    if (mode === "auto" || mode === "pr" || mode === "issue" || mode === "release")
        return mode;
    throw new Error(`Invalid mode: ${mode}`);
}
function readEvent() {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath || !existsSync(eventPath))
        return {};
    return readJsonFile(eventPath);
}
function selectMode(mode, event) {
    if (mode !== "auto")
        return mode;
    if (event.pull_request)
        return "pr";
    if (event.issue && !event.issue.pull_request)
        return "issue";
    if (event.release)
        return "release";
    return "release";
}
async function fetchPullRequestDiff(token, event) {
    const pullNumber = event.pull_request?.number;
    if (!token || !pullNumber)
        return "";
    const octokit = github.getOctokit(token);
    const response = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: pullNumber,
        mediaType: {
            format: "diff"
        }
    });
    return typeof response.data === "string" ? response.data : "";
}
function readGitDiff() {
    try {
        return execFileSync("git", ["diff", "--unified=0", "HEAD~1..HEAD"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"]
        });
    }
    catch {
        try {
            return execFileSync("git", ["show", "--format=", "--unified=0", "HEAD"], {
                encoding: "utf8",
                stdio: ["ignore", "pipe", "ignore"]
            });
        }
        catch {
            return "";
        }
    }
}
async function maybeAgentSummary(result, diffPath) {
    const apiKey = core.getInput("openai-api-key") || process.env.OPENAI_API_KEY;
    if (!apiKey)
        return undefined;
    try {
        return await createAgentSummary(result, {
            apiKey,
            baseUrl: core.getInput("openai-base-url") || process.env.OPENAI_BASE_URL,
            model: core.getInput("openai-model") || process.env.OPENAI_MODEL,
            context: diffPath ? readTextFile(diffPath) : ""
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        core.warning(`Agent summary skipped: ${message}`);
        return undefined;
    }
}
async function upsertComment(token, mode, event, report) {
    const issueNumber = event.pull_request?.number ?? event.issue?.number;
    if (!token || !issueNumber)
        return;
    const octokit = github.getOctokit(token);
    const marker = `${markerPrefix}${mode}:${issueNumber} -->`;
    const body = `${report}\n${marker}`;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const comments = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100
    });
    const existing = comments.data.find((comment) => comment.body?.includes(marker));
    if (existing) {
        await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: existing.id,
            body
        });
    }
    else {
        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body
        });
    }
}
function labelsFromEvent(labels) {
    return labels?.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean);
}
run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
});
//# sourceMappingURL=action.js.map