"use client";

import { Check, X } from "lucide-react";
import {
    advanceAgentRun,
    endAgentRun,
    findAgent,
    goToAgentStage,
    useAgentRun,
} from "@/app/lib/agents";

const HINT: Record<"ask" | "upload" | "auto", string> = {
    ask: "Answer the agent's questions, then send.",
    upload: "Attach the documents with the paperclip, then send.",
    auto: "Send a message such as \"Go\" to run this stage.",
};

/** A horizontal rail of stages above the composer while an agent run is on. */
export function AgentStageRail() {
    const run = useAgentRun();
    const agent = run ? findAgent(run.agentId) : undefined;
    if (!run || !agent) return null;
    const last = run.stage >= agent.stages.length - 1;
    const stage = agent.stages[run.stage];

    return (
        <section
            aria-label={`${agent.name} agent, stage ${run.stage + 1} of ${agent.stages.length}`}
            className="mb-2 rounded-md border border-gray-200 bg-white px-3 py-2.5"
            data-name="agent-stage-rail"
        >
            <div className="flex items-center justify-between gap-2">
                <p className="truncate font-serif text-sm text-gray-900">
                    {agent.name}
                </p>
                <div className="flex items-center gap-1.5">
                    {!last && (
                        <button
                            type="button"
                            onClick={advanceAgentRun}
                            className="h-7 rounded-md bg-ecl-maroon px-2.5 text-xs text-ecl-paper hover:bg-ecl-maroon-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold"
                        >
                            Next stage
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={endAgentRun}
                        aria-label={last ? "Finish agent run" : "End agent run"}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            <ol className="mt-2 flex items-start">
                {agent.stages.map((s, i) => {
                    const done = i < run.stage;
                    const active = i === run.stage;
                    return (
                        <li
                            key={s.title}
                            className="relative flex min-w-0 flex-1 flex-col items-start"
                        >
                            {i > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute left-[-50%] right-1/2 top-[6px] h-px ${
                                        i <= run.stage
                                            ? "bg-ecl-gold"
                                            : "bg-gray-200"
                                    }`}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => goToAgentStage(i)}
                                aria-current={active ? "step" : undefined}
                                className="relative z-10 flex flex-col items-start gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold"
                            >
                                <span
                                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                                        done
                                            ? "border-ecl-gold bg-ecl-gold text-white"
                                            : active
                                              ? "border-ecl-gold bg-white ring-2 ring-ecl-gold/40"
                                              : "border-gray-300 bg-white"
                                    }`}
                                >
                                    {done && <Check className="h-2.5 w-2.5" />}
                                </span>
                                <span
                                    className={`max-w-full truncate text-[11px] ${
                                        active
                                            ? "font-medium text-gray-900"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {s.title}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
            <p className="mt-2 text-xs text-gray-600">{HINT[stage.expects]}</p>
        </section>
    );
}
