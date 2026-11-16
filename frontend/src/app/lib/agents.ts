/**
 * Multi-step agents. An agent is a list of stages. The run lives in a small
 * client store so it survives page changes. Each message sent while a run is
 * active carries the current stage to the backend (see agentStage.ts).
 */
import { useSyncExternalStore } from "react";

export type AgentStageDef = {
    title: string;
    instruction: string;
    expects: "ask" | "upload" | "auto";
};

export type AgentDef = {
    id: string;
    name: string;
    summary: string;
    stages: AgentStageDef[];
    builtIn?: boolean;
    /** Standing facts the agent always keeps in mind. */
    context?: string;
};

export type AgentRun = { agentId: string; stage: number; context?: string };

export type AgentStagePayload = {
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

const INDIA =
    "Apply Indian law and practice. Name the statute, rule or circular and mark anything you could not verify.";

export const BUILT_IN_AGENTS: AgentDef[] = [
    {
        id: "due-diligence",
        name: "Due Diligence",
        summary:
            "Goes through a data room against your checklist and flags issues by risk. It drafts the findings report and stops for your sign-off at each stage.",
        builtIn: true,
        stages: [
            {
                title: "Intake",
                expects: "ask",
                instruction: `Ask for the term sheet and the basic transaction facts: parties, investor and investee, structure, round size and valuation, sector, governing law, timeline, and the key commercial concerns. Ask the user to attach the term sheet and any charter documents. When they arrive, read them and summarise the deal in a short table, with gaps marked. ${INDIA}`,
            },
            {
                title: "IRL",
                expects: "ask",
                instruction: `Prepare the information request list (IRL) for this transaction, tailored to the deal facts and sector. Group requests by workstream: corporate, FEMA and foreign investment, tax, IP, employment, data protection under the DPDP Act 2023, litigation, and regulatory. Present it as a table with columns Ref, Request, Why it matters, Priority. Then invite the user to add, remove or reword items, and revise the list as they respond. ${INDIA}`,
            },
            {
                title: "Documents",
                expects: "upload",
                instruction: `Ask the user to upload the data room documents in batches. For each batch, read every document and log it against the IRL: received, partly received, missing. Note red flags as you go with the document and clause. Keep a running tracker table.`,
            },
            {
                title: "Report",
                expects: "auto",
                instruction: `Prepare the due diligence report from the IRL tracker and the documents read. Structure: executive summary with the top issues, a risk-rated findings table (High, Medium, Low) with document and clause references, workstream-by-workstream findings, recommended conditions precedent and warranties or indemnities, and open items. Never state a finding you cannot tie to a document. ${INDIA}`,
            },
        ],
    },
    {
        id: "contract-negotiation",
        name: "Contract Review and Redline",
        summary:
            "Takes your side's playbook, reviews the counterparty draft clause by clause, and proposes redlines you can send.",
        builtIn: true,
        stages: [
            {
                title: "Brief",
                expects: "ask",
                instruction: `Ask which side the user acts for, the commercial deal, the red lines, and any fallback positions. Ask them to attach the draft agreement. Confirm the brief back in five lines.`,
            },
            {
                title: "Review",
                expects: "upload",
                instruction: `Review the attached draft clause by clause against the brief. Produce a table: Clause, Issue, Risk, Proposed fix. Flag clauses that conflict with Indian law, such as non-competes under section 27 of the Contract Act 1872, stamp duty, and arbitration seat points. ${INDIA}`,
            },
            {
                title: "Redline",
                expects: "auto",
                instruction: `Draft replacement language for each flagged clause, ready to paste into a redline. Then draft a short covering note to the counterparty that explains the main changes in a firm and courteous tone.`,
            },
        ],
    },
    {
        id: "regulatory-roadmap",
        name: "India Regulatory Roadmap",
        summary:
            "Maps the Indian licences, filings and compliance steps a business needs, then sequences them into a plan.",
        builtIn: true,
        stages: [
            {
                title: "Business",
                expects: "ask",
                instruction: `Ask what the business does, who it serves, what data it handles, who owns it, and where it operates. Research the business on the web and summarise what you found with sources.`,
            },
            {
                title: "Map",
                expects: "auto",
                instruction: `Map the Indian regulators and laws that apply: company law, FEMA and FDI, tax and GST, labour, data protection (DPDP Act 2023), IT Act and CERT-In, sector regulators (RBI, SEBI, IRDAI, TRAI, CCI). Present a table: Area, Law or regulator, What it requires, Status unknown or confirmed. ${INDIA}`,
            },
            {
                title: "Plan",
                expects: "auto",
                instruction: `Turn the map into a sequenced 90-day plan: what to do this week, this month, this quarter, with owners and dependencies. End with the five risks that need the CEO's attention.`,
            },
        ],
    },
];

export const MAGIC_LAB_AGENT: AgentDef = {
    id: "magic-lab",
    name: "Magic Lab: In-house team",
    summary: "Becomes the in-house legal team of one client.",
    builtIn: true,
    stages: [
        {
            title: "Know the client",
            expects: "auto",
            instruction: `Read the client narrative the user gave. Research the business and its sector on the web: what it sells, who regulates it, its structure, funding and recent news. Write a one-page client profile with sources, and list what you could not find. ${INDIA}`,
        },
        {
            title: "In-house brief",
            expects: "auto",
            instruction: `Act as this client's in-house legal team. Write three parts. First, legal steps to take today, as a short ordered list with the law behind each. Second, a forward look: expected changes in Indian law and regulation in the next 12 to 24 months that affect this client, with the status of each as far as you can verify. Third, the top 10 things the in-house team and the CEO should keep in mind, each in two lines. Keep it concrete to this business.`,
        },
        {
            title: "Assess documents",
            expects: "upload",
            instruction: `Ask the user to attach the client's documents. Read each one and assess it against the client profile and brief from this conversation. Produce three lists: what works, what to fix (with a proposed fix), and what is missing. Cite the document and clause for every point. Remember each document for the rest of this conversation.`,
        },
        {
            title: "Standing advice",
            expects: "ask",
            instruction: `Answer questions as the client's in-house team, using everything learned in this conversation: the profile, the brief and all assessed documents. Say which document or earlier point your advice rests on. Flag when new facts change an earlier recommendation.`,
        },
    ],
};

const CUSTOM_KEY = "ecl-custom-agents";
const RUN_KEY = "ecl-agent-run";

export function loadCustomAgents(): AgentDef[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(CUSTOM_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveCustomAgents(agents: AgentDef[]): void {
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(agents));
}

export function allAgents(): AgentDef[] {
    return [...BUILT_IN_AGENTS, ...loadCustomAgents()];
}

export function findAgent(id: string): AgentDef | undefined {
    if (id === MAGIC_LAB_AGENT.id) return MAGIC_LAB_AGENT;
    return allAgents().find((a) => a.id === id);
}

export function agentStagePayload(
    agent: AgentDef,
    stage: number,
    context?: string,
): AgentStagePayload {
    const s = agent.stages[stage];
    return {
        agentName: agent.name,
        index: stage,
        total: agent.stages.length,
        title: s.title,
        instruction: s.instruction,
        expects: s.expects,
        earlier: agent.stages.slice(0, stage).map((x) => x.title),
        later: agent.stages.slice(stage + 1).map((x) => x.title),
        ...((context ?? agent.context) ? { context: context ?? agent.context } : {}),
    };
}

// A tiny external store for the active run.
let current: AgentRun | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
        const raw = window.localStorage.getItem(RUN_KEY);
        current = raw ? (JSON.parse(raw) as AgentRun) : null;
    } catch {
        current = null;
    }
}

function emit(): void {
    if (typeof window !== "undefined") {
        if (current) window.localStorage.setItem(RUN_KEY, JSON.stringify(current));
        else window.localStorage.removeItem(RUN_KEY);
    }
    listeners.forEach((l) => l());
}

export function getAgentRun(): AgentRun | null {
    load();
    return current;
}

export function startAgentRun(agentId: string, context?: string): void {
    load();
    current = { agentId, stage: 0, ...(context ? { context } : {}) };
    emit();
}

export function advanceAgentRun(): void {
    load();
    if (!current) return;
    const agent = findAgent(current.agentId);
    if (!agent) return;
    if (current.stage + 1 >= agent.stages.length) return;
    current = { ...current, stage: current.stage + 1 };
    emit();
}

export function goToAgentStage(stage: number): void {
    load();
    if (!current) return;
    current = { ...current, stage };
    emit();
}

export function endAgentRun(): void {
    load();
    current = null;
    emit();
}

function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function useAgentRun(): AgentRun | null {
    return useSyncExternalStore(subscribe, getAgentRun, () => null);
}
