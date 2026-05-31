import { describe, expect, it } from "vitest";
import { analyzeIssue } from "../src/analyzers/issue.js";
import { resultToMarkdown } from "../src/report.js";

describe("markdown report", () => {
  it("renders a maintainer-facing report", () => {
    const result = analyzeIssue({
      title: "How do I configure this?",
      body: "How do I configure this project for Windows?",
      labels: []
    });

    const markdown = resultToMarkdown(result);

    expect(markdown).toContain("Maintainer Flow report");
    expect(markdown).toContain("Overall risk");
    expect(markdown).toContain("Maintainer note");
  });
});
