import { describe, expect, it } from "vitest";
import { agentStagePrompt, parseAgentStage } from "../agentStage";

const good = {
  agentName: "Due Diligence",
  index: 1,
  total: 4,
  title: "IRL",
  instruction: "Draft the information request list.",
  expects: "ask",
  earlier: ["Intake"],
  later: ["Documents", "Report"],
};

describe("agent stage", () => {
  it("parses a valid stage", () => {
    expect(parseAgentStage(good)?.title).toBe("IRL");
  });
  it("rejects bad input", () => {
    expect(parseAgentStage(null)).toBeUndefined();
    expect(parseAgentStage({ ...good, index: 9 })).toBeUndefined();
    expect(parseAgentStage({ ...good, instruction: "" })).toBeUndefined();
  });
  it("builds a prompt that names the stage and gate", () => {
    const p = agentStagePrompt(parseAgentStage(good));
    expect(p).toContain("stage 2 of 4: IRL");
    expect(p).toContain("Stage gate:");
    expect(p).toContain("Do not do their work now");
  });
  it("returns nothing without a stage", () => {
    expect(agentStagePrompt(undefined)).toBeUndefined();
  });
});
