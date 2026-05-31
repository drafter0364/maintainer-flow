import { highestRisk } from "../risk.js";
import { parseUnifiedDiff } from "./diff.js";
import type { AnalysisResult, Finding, ReleaseInput } from "../types.js";

export function analyzeRelease(input: ReleaseInput): AnalysisResult {
  const findings: Finding[] = [];
  const notes = input.notes?.trim() ?? "";
  const diff = input.diff?.trim() ?? "";
  const summary = diff ? parseUnifiedDiff(diff) : undefined;
  const categories = new Set(summary?.categories ?? []);

  if (!input.version) {
    findings.push({
      kind: "release",
      risk: "medium",
      title: "Release version was not provided",
      details: "A clear version is needed for changelog, package, and support references.",
      recommendation: "Provide the target version and confirm it matches package metadata and tags."
    });
  }

  if (notes.length < 120) {
    findings.push({
      kind: "documentation",
      risk: "medium",
      title: "Release notes look sparse",
      details: "Maintainers and downstream users may not have enough context to assess upgrade impact.",
      recommendation: "Include highlights, breaking changes, migration notes, and acknowledgements."
    });
  }

  if (categories.has("dependency")) {
    findings.push({
      kind: "dependency",
      risk: "medium",
      title: "Release includes dependency changes",
      details: "Dependency updates can affect consumers even when public APIs are unchanged.",
      recommendation: "Run vulnerability checks and call out notable dependency upgrades in the release notes."
    });
  }

  if (categories.has("ci")) {
    findings.push({
      kind: "ci",
      risk: "high",
      title: "Release includes workflow changes",
      details: "CI and release automation changes can affect provenance, credentials, and published artifacts.",
      recommendation: "Review publishing permissions, token scopes, and artifact generation before tagging."
    });
  }

  const risk = highestRisk(findings, "low");

  return {
    mode: "release",
    risk,
    summary:
      risk === "high"
        ? "Release should wait for maintainer review of high-risk automation changes."
        : "Release readiness check completed with the notes below.",
    findings,
    signals: [
      { label: "Version", value: input.version || "not provided" },
      { label: "Release notes", value: `${notes.length} characters` },
      { label: "Files changed", value: String(summary?.files.length ?? 0) },
      { label: "Categories", value: summary?.categories.join(", ") || "none" }
    ]
  };
}
