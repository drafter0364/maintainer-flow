import { describe, expect, it } from "vitest";
import { analyzeIssue } from "../src/analyzers/issue.js";

describe("issue analysis", () => {
  it("detects potentially sensitive public security reports", () => {
    const result = analyzeIssue({
      title: "Possible token leak vulnerability",
      body: "I found a credential leak in the token handling path.",
      labels: []
    });

    expect(result.risk).toBe("high");
    expect(result.signals.find((signal) => signal.label === "Suggested labels")?.value).toContain("security");
  });

  it("asks for reproduction details on vague bug reports", () => {
    const result = analyzeIssue({
      title: "Bug: app crashes",
      body: "It crashes on startup.",
      labels: ["bug"]
    });

    expect(result.risk).toBe("medium");
    expect(result.findings.some((finding) => finding.title.includes("reproducibility"))).toBe(true);
  });

  it("does not treat casual words as structured bug report sections", () => {
    const result = analyzeIssue({
      title: "Bug: error when saving",
      body: "You should also check the logs. I got an error email on Windows.",
      labels: ["bug"]
    });

    expect(result.findings.some((finding) => finding.details.includes("expected behavior"))).toBe(true);
    expect(result.findings.some((finding) => finding.details.includes("actual behavior"))).toBe(true);
  });
});
