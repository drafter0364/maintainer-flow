import { describe, expect, it } from "vitest";
import { highestRisk, isAtLeastRisk, parseFailOnRisk, riskRank } from "../src/risk.js";
import type { Finding } from "../src/types.js";

describe("risk helpers", () => {
  it("parses valid fail-on thresholds", () => {
    expect(parseFailOnRisk(undefined)).toBe("none");
    expect(parseFailOnRisk("none")).toBe("none");
    expect(parseFailOnRisk("low")).toBe("low");
    expect(parseFailOnRisk("medium")).toBe("medium");
    expect(parseFailOnRisk("high")).toBe("high");
  });

  it("rejects invalid fail-on thresholds", () => {
    expect(() => parseFailOnRisk("critical")).toThrow("Invalid fail-on value");
  });

  it("aggregates and compares risk levels", () => {
    const findings: Finding[] = [
      {
        kind: "testing",
        risk: "medium",
        title: "Missing tests",
        details: "Runtime code changed without tests.",
        recommendation: "Add coverage."
      },
      {
        kind: "security",
        risk: "high",
        title: "Auth change",
        details: "Security-sensitive path changed.",
        recommendation: "Request security review."
      }
    ];

    expect(highestRisk(findings)).toBe("high");
    expect(isAtLeastRisk("high", "medium")).toBe(true);
    expect(isAtLeastRisk("low", "medium")).toBe(false);
    expect(riskRank("medium")).toBeGreaterThan(riskRank("low"));
  });
});
