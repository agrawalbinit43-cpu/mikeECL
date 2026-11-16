"use client";

import { useRouter } from "next/navigation";
import { useChatHistoryContext } from "@/app/contexts/ChatHistoryContext";
import {
    agentStagePayload,
    findAgent,
    startAgentRun,
} from "@/app/lib/agents";

/** Starts an agent run and opens a new chat that sends its first stage. */
export function useLaunchAgent() {
    const router = useRouter();
    const { setNewChatMessages } = useChatHistoryContext();
    return (agentId: string, opening: string, context?: string) => {
        const agent = findAgent(agentId);
        if (!agent) return;
        startAgentRun(agentId, context);
        setNewChatMessages([
            {
                role: "user",
                content: opening.trim() || `Start the ${agent.name} agent.`,
                agentStage: agentStagePayload(agent, 0, context),
            },
        ]);
        router.push("/assistant");
    };
}
