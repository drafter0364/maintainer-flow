import { describe, expect, it } from "vitest";
import { labelsFromEvent, selectMode } from "../src/actionHelpers.js";

describe("action helpers", () => {
  it("infers action mode from supported event payloads", () => {
    expect(selectMode("auto", { pull_request: { number: 1 } })).toBe("pr");
    expect(selectMode("auto", { issue: { number: 2 } })).toBe("issue");
    expect(selectMode("auto", { release: { tag_name: "v1.0.0" } })).toBe("release");
  });

  it("does not treat pull_request-shaped issues as issue events", () => {
    expect(() => selectMode("auto", { issue: { number: 3, pull_request: {} } })).toThrow("could not infer");
  });

  it("requires explicit mode for unsupported event payloads", () => {
    expect(() => selectMode("auto", {})).toThrow("could not infer");
    expect(selectMode("release", {})).toBe("release");
  });

  it("normalizes event labels", () => {
    expect(labelsFromEvent(["bug", { name: "needs-triage" }, { name: "" }])).toEqual(["bug", "needs-triage"]);
  });
});
