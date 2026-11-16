/**
 * Multi-step agents. A user-defined or built-in agent is a list of stages.
 * The client sends the active stage with each turn. The model works on that
 * stage only, asks for what the stage needs, and stops at the stage gate so
 * the user decides when to move on.
 */
export type AgentStageInput = {
  agentName: string;
  index: number;
  total: number;
  title: string;
  instruction: string;
  expects: "ask" | "upload" | "auto";
  earlier: string[];
  later: string[];
  context?: string;
};

const clip = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

const clipList = (v: unknown, n: number, max: number): string[] =>
  Array.isArray(v)
    ? v.slice(0, n).map((x) => clip(x, max)).filter(Boolean)
    : [];

export function parseAgentStage(value: unknown): AgentStageInput | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const agentName = clip(v.agentName, 80);
  const title = clip(v.title, 80);
  const instruction =
    typeof v.instruction === "string" ? v.instruction.trim().slice(0, 4000) : "";
  const total = Number(v.total);
  const index = Number(v.index);
  if (!agentName || !title || !instruction) return undefined;
  if (!Number.isInteger(total) || total < 1 || total > 12) return undefined;
  if (!Number.isInteger(index) || index < 0 || index >= total) return undefined;
  const expects =
    v.expects === "upload" || v.expects === "auto" ? v.expects : "ask";
  const context =
    typeof v.context === "string" ? v.context.trim().slice(0, 6000) : undefined;
  return {
    agentName,
    index,
    total,
    title,
    instruction,
    expects,
    earlier: clipList(v.earlier, 12, 80),
    later: clipList(v.later, 12, 80),
    ...(context ? { context } : {}),
  };
}

export function agentStagePrompt(stage: AgentStageInput | undefined): string | undefined {
  if (!stage) return undefined;
  const expectLine =
    stage.expects === "upload"
      ? "This stage needs documents from the user. If none are attached, say exactly which documents you need and ask the user to attach them with the paperclip, then stop. If documents are attached, read every one with your document tools before you answer."
      : stage.expects === "ask"
        ? "This stage needs information from the user. Ask for what is missing in one short, numbered list (at most eight items), then stop. If the user has already supplied it, use it and do the work."
        : "This stage needs no input from the user. Do the work now.";
  return `AGENT MODE (ACTIVE FOR THIS TURN):
You are the "${stage.agentName}" agent, running stage ${stage.index + 1} of ${stage.total}: ${stage.title}.
${stage.earlier.length ? `Stages already run: ${stage.earlier.join("; ")}. Use their output from this conversation.` : "This is the first stage."}
${stage.later.length ? `Stages still to come: ${stage.later.join("; ")}. Do not do their work now.` : "This is the last stage."}
${stage.context ? `\nStanding context for this agent (treat as given facts):\n${stage.context}\n` : ""}
Your task for this stage:
${stage.instruction}

${expectLine}

Work only on this stage. Keep Indian law and Indian practice at the centre. Never invent facts, citations, or documents; mark gaps. End your reply with one line starting "Stage gate:" that says what you need or what is ready, and tells the user they can press "Next stage" when they are satisfied. Do not move on yourself.`;
}
