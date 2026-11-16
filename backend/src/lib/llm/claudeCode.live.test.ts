import { describe, expect, it } from "vitest";
import { streamWithProvider } from "./providers";
import { claudeCodeStatus } from "./claudeCode";

// Live check against the local Claude login. Skipped unless ECL_LIVE_CLAUDE=1.
const live = process.env.ECL_LIVE_CLAUDE === "1";
describe.skipIf(!live)("claude subscription provider (live)", () => {
  it("answers and runs a bridged tool", async () => {
    expect(claudeCodeStatus().signedIn).toBe(true);
    let text = "";
    const started: string[] = [];
    await streamWithProvider({
      model: "claude-code/haiku",
      systemPrompt: "You are ECL AI. Be brief. Use tools when asked.",
      messages: [{ role: "user", content: "Use the lookup_clause tool for clause 7 and tell me the governing law." }],
      tools: [{ type: "function", function: { name: "lookup_clause", description: "Find a clause by number", parameters: { type: "object", properties: { n: { type: "number" } }, required: ["n"] } } }],
      runTools: async (calls) => calls.map((c) => ({ tool_use_id: c.id, content: "Clause 7: governed by the laws of India." })),
      callbacks: { onContentDelta: (t) => (text += t), onToolCallStart: (c) => started.push(c.name) },
    } as never);
    console.log("TEXT:", text, "TOOLS:", started);
    expect(started).toContain("lookup_clause");
    expect(text.toLowerCase()).toContain("india");
  }, 120_000);
});
