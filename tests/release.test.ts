import { describe, expect, it } from "vitest";
import { analyzeRelease } from "../src/analyzers/release.js";

describe("release analysis", () => {
  it("flags sparse release notes and missing versions", () => {
    const result = analyzeRelease({
      notes: "Bug fixes."
    });

    expect(result.risk).toBe("medium");
    expect(result.findings.map((finding) => finding.kind)).toContain("release");
    expect(result.findings.map((finding) => finding.kind)).toContain("documentation");
  });
});
