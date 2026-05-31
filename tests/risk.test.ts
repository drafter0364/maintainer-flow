import { describe, expect, it } from "vitest";
import { parseFailOnRisk } from "../src/risk.js";

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
});
