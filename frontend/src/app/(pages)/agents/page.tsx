"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
    BUILT_IN_AGENTS,
    loadCustomAgents,
    saveCustomAgents,
    type AgentDef,
    type AgentStageDef,
} from "@/app/lib/agents";
import { useLaunchAgent } from "@/app/components/assistant/useLaunchAgent";

const EMPTY_STAGE: AgentStageDef = { title: "", instruction: "", expects: "ask" };
const EXPECTS_LABEL = {
    ask: "Asks you questions",
    upload: "Waits for documents",
    auto: "Runs on its own",
} as const;

function AgentCard({
    agent,
    onRun,
    onDelete,
}: {
    agent: AgentDef;
    onRun: () => void;
    onDelete?: () => void;
}) {
    return (
        <article
            data-name={`agent-${agent.id}`}
            className="flex flex-col rounded-md border border-gray-200 bg-white p-4"
        >
            <h2 className="font-serif text-xl text-gray-900">{agent.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{agent.summary}</p>
            <ol className="mt-3 space-y-1.5 border-l border-ecl-gold/60 pl-3">
                {agent.stages.map((s) => (
                    <li key={s.title} className="text-sm">
                        <span className="font-medium text-gray-900">
                            {s.title}
                        </span>
                        <span className="text-gray-500">
                            {" "}
                            {EXPECTS_LABEL[s.expects]}
                        </span>
                    </li>
                ))}
            </ol>
            <div className="mt-4 flex items-center gap-2">
                <button
                    type="button"
                    onClick={onRun}
                    className="h-10 rounded-md bg-ecl-maroon px-4 text-sm text-ecl-paper hover:bg-ecl-maroon-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold"
                >
                    Run agent
                </button>
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={`Delete ${agent.name}`}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </article>
    );
}

function Builder({ onSave }: { onSave: (a: AgentDef) => void }) {
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [stages, setStages] = useState<AgentStageDef[]>([
        { ...EMPTY_STAGE },
        { ...EMPTY_STAGE },
    ]);
    const valid =
        name.trim() &&
        stages.length > 0 &&
        stages.every((s) => s.title.trim() && s.instruction.trim());
    const setStage = (i: number, patch: Partial<AgentStageDef>) =>
        setStages((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
    const field =
        "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ecl-gold";

    return (
        <form
            className="space-y-4 rounded-md border border-gray-200 bg-white p-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                onSave({
                    id: `custom-${Date.now()}`,
                    name: name.trim(),
                    summary: summary.trim() || "A custom agent.",
                    stages: stages.map((s) => ({
                        ...s,
                        title: s.title.trim(),
                        instruction: s.instruction.trim(),
                    })),
                });
                setName("");
                setSummary("");
                setStages([{ ...EMPTY_STAGE }, { ...EMPTY_STAGE }]);
            }}
        >
            <h2 className="font-serif text-xl text-gray-900">Create an agent</h2>
            <label className="block text-sm text-gray-800">
                Name
                <input
                    className={`${field} mt-1`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Shareholders' agreement review"
                />
            </label>
            <label className="block text-sm text-gray-800">
                What it does
                <input
                    className={`${field} mt-1`}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />
            </label>
            <div className="space-y-3">
                {stages.map((s, i) => (
                    <fieldset
                        key={i}
                        className="space-y-2 border-l border-ecl-gold/60 pl-3"
                    >
                        <legend className="sr-only">Stage {i + 1}</legend>
                        <div className="flex gap-2">
                            <input
                                aria-label={`Stage ${i + 1} title`}
                                className={field}
                                value={s.title}
                                onChange={(e) => setStage(i, { title: e.target.value })}
                                placeholder={`Stage ${i + 1} title`}
                            />
                            <select
                                aria-label={`Stage ${i + 1} input`}
                                className={`${field} max-w-[11rem]`}
                                value={s.expects}
                                onChange={(e) =>
                                    setStage(i, {
                                        expects: e.target.value as AgentStageDef["expects"],
                                    })
                                }
                            >
                                <option value="ask">Asks you questions</option>
                                <option value="upload">Waits for documents</option>
                                <option value="auto">Runs on its own</option>
                            </select>
                            {stages.length > 1 && (
                                <button
                                    type="button"
                                    aria-label={`Remove stage ${i + 1}`}
                                    onClick={() =>
                                        setStages((all) => all.filter((_, j) => j !== i))
                                    }
                                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <textarea
                            aria-label={`Stage ${i + 1} instruction`}
                            className={`${field} min-h-[72px]`}
                            value={s.instruction}
                            onChange={(e) => setStage(i, { instruction: e.target.value })}
                            placeholder="What should the agent do in this stage?"
                        />
                    </fieldset>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setStages((all) => [...all, { ...EMPTY_STAGE }])}
                    className="inline-flex h-10 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-sm text-gray-800 hover:bg-gray-50"
                >
                    <Plus className="h-4 w-4" /> Add stage
                </button>
                <button
                    type="submit"
                    disabled={!valid}
                    className="h-10 rounded-md bg-ecl-maroon px-4 text-sm text-ecl-paper hover:bg-ecl-maroon-ink disabled:opacity-40"
                >
                    Save agent
                </button>
            </div>
        </form>
    );
}

export default function AgentsPage() {
    const [custom, setCustom] = useState<AgentDef[]>([]);
    const launch = useLaunchAgent();
    useEffect(() => setCustom(loadCustomAgents()), []);
    const update = (next: AgentDef[]) => {
        setCustom(next);
        saveCustomAgents(next);
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 py-8">
                <h1 className="font-serif text-3xl text-gray-900">Agents</h1>
                <p className="mt-2 max-w-xl text-sm text-gray-600">
                    An agent works through stages. It asks for what it needs,
                    waits for your documents, and stops at each gate until you
                    press Next stage.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[...BUILT_IN_AGENTS, ...custom].map((a) => (
                        <AgentCard
                            key={a.id}
                            agent={a}
                            onRun={() => launch(a.id, "")}
                            onDelete={
                                a.builtIn
                                    ? undefined
                                    : () => update(custom.filter((c) => c.id !== a.id))
                            }
                        />
                    ))}
                </div>
                <div className="mt-8">
                    <Builder onSave={(a) => update([...custom, a])} />
                </div>
            </div>
        </div>
    );
}
