import { afterEach, describe, expect, it, vi } from "vitest";
import { createAgentSummary } from "../src/ai/openaiCompatible.js";
import type { AnalysisResult } from "../src/types.js";

const result: AnalysisResult = {
  mode: "issue",
  risk: "low",
  summary: "Summary",
  findings: [],
  signals: []
};

describe("OpenAI-compatible summaries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips network calls when no API key is provided", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(createAgentSummary(result, {})).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends valid JSON content with truncated context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "agent summary" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const summary = await createAgentSummary(result, {
      apiKey: "test-key",
      context: "x".repeat(20),
      maxContextCharacters: 8,
      timeoutMs: 1_000
    });

    expect(summary).toBe("agent summary");
    const request = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
      messages: Array<{ content: string }>;
    };
    const userContent = JSON.parse(request.messages[1]?.content ?? "{}") as { context: string };
    expect(userContent.context).toContain("[truncated 12 characters]");
  });

  it("surfaces HTTP errors from the provider", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "bad request" } }), {
        status: 400,
        headers: { "content-type": "application/json" }
      })
    );

    await expect(createAgentSummary(result, { apiKey: "test-key", timeoutMs: 1_000 })).rejects.toThrow("bad request");
  });
});
