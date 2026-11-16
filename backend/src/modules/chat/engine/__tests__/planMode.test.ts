import { describe, expect, it } from "vitest";
import { parsePlanMode, planModePrompt } from "../planMode";

describe("plan mode", () => {
  it("accepts only plan and execute", () => {
    expect(parsePlanMode("plan")).toBe("plan");
    expect(parsePlanMode("execute")).toBe("execute");
    expect(parsePlanMode("other")).toBeUndefined();
    expect(parsePlanMode(undefined)).toBeUndefined();
  });

  it("tells the model to stop after the plan and wait for approval", () => {
    const prompt = planModePrompt("plan") ?? "";
    expect(prompt).toContain("Reply 'go ahead' to run this plan");
    expect(prompt).toContain("Do not start the deliverable");
  });

  it("tells the model to run the approved plan", () => {
    expect(planModePrompt("execute")).toContain("Carry out that plan now");
    expect(planModePrompt(undefined)).toBeNull();
  });
});
