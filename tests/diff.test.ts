import { describe, expect, it } from "vitest";
import { analyzePullRequest, classifyFile, parseUnifiedDiff } from "../src/analyzers/diff.js";

const sourceOnlyDiff = `diff --git a/src/auth.ts b/src/auth.ts
index 1111111..2222222 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1 +1,2 @@
-export const enabled = false;
+export const enabled = true;
+export const mode = "strict";
`;

describe("diff analysis", () => {
  it("classifies common maintainer-sensitive paths", () => {
    expect(classifyFile(".github/workflows/ci.yml")).toBe("ci");
    expect(classifyFile("package-lock.json")).toBe("dependency");
    expect(classifyFile("src/auth/session.ts")).toBe("security");
    expect(classifyFile("tests/unit.test.ts")).toBe("test");
    expect(classifyFile("README.md")).toBe("docs");
  });

  it("parses unified diffs into file and line counts", () => {
    const summary = parseUnifiedDiff(sourceOnlyDiff);

    expect(summary.files).toHaveLength(1);
    expect(summary.additions).toBe(2);
    expect(summary.deletions).toBe(1);
    expect(summary.categories).toContain("security");
  });

  it("flags source changes without tests", () => {
    const result = analyzePullRequest({ diff: sourceOnlyDiff });

    expect(result.risk).toBe("high");
    expect(result.findings.map((finding) => finding.kind)).toContain("security");
    expect(result.findings.map((finding) => finding.kind)).toContain("testing");
  });
});
