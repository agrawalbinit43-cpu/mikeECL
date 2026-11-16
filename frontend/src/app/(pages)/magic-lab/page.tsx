"use client";

import { useState } from "react";
import { MAGIC_LAB_AGENT } from "@/app/lib/agents";
import { useLaunchAgent } from "@/app/components/assistant/useLaunchAgent";

const SECTIONS = [
    ["Role", "The client's in-house legal team."],
    ["Knowledge", "Your narrative, the web, and every document you add."],
    ["Guardrails", "Cites documents, marks gaps, never invents facts."],
    ["Output", "Steps for today, a regulatory outlook, a top 10 for the CEO."],
];

export default function MagicLabPage() {
    const [client, setClient] = useState("");
    const [narrative, setNarrative] = useState("");
    const launch = useLaunchAgent();
    const ready = narrative.trim().length > 40;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <h1 className="font-serif text-3xl text-gray-900">Magic Lab</h1>
                <p className="mt-2 max-w-xl text-sm text-gray-600">
                    Describe a client and its business. ECL AI researches it and
                    builds the client&apos;s in-house legal team. Add documents
                    later and the team assesses them against what it learned.
                </p>
                <div className="mt-6 grid overflow-hidden rounded-md border border-gray-200 bg-white md:grid-cols-2">
                    <form
                        className="space-y-3 border-b border-gray-200 p-5 md:border-b-0 md:border-r"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!ready) return;
                            const name = client.trim() || "the client";
                            launch(
                                MAGIC_LAB_AGENT.id,
                                `Client: ${name}\n\nNarrative:\n${narrative.trim()}`,
                                `Client: ${name}`,
                            );
                        }}
                    >
                        <h2 className="font-serif text-xl text-gray-900">
                            Client narrative
                        </h2>
                        <label className="block text-sm text-gray-800">
                            Client name
                            <input
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ecl-gold"
                            />
                        </label>
                        <label className="block text-sm text-gray-800">
                            Who they are and what they do
                            <textarea
                                value={narrative}
                                onChange={(e) => setNarrative(e.target.value)}
                                placeholder="A Bengaluru pet-care brand that makes shampoo and soap, sells through its site and two marketplaces, and plans to raise a seed round."
                                className="mt-1 min-h-[220px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 font-serif text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-ecl-gold"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={!ready}
                            className="h-10 rounded-md bg-ecl-maroon px-4 text-sm text-ecl-paper hover:bg-ecl-maroon-ink disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold"
                        >
                            Build bot
                        </button>
                    </form>
                    <div className="p-5">
                        <h2 className="font-serif text-xl text-gray-900">
                            In-house team bot
                        </h2>
                        <dl className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
                            {SECTIONS.map(([t, d]) => (
                                <div key={t} className="py-2.5">
                                    <dt className="text-sm font-medium text-gray-900">{t}</dt>
                                    <dd className="text-sm text-gray-600">{d}</dd>
                                </div>
                            ))}
                        </dl>
                        <ol className="mt-4 space-y-1 text-sm text-gray-700">
                            {MAGIC_LAB_AGENT.stages.map((s) => (
                                <li key={s.title}>{s.title}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
