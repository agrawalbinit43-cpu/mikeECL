import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AgentStageRail } from "./AgentStageRail";
import { endAgentRun, getAgentRun, startAgentRun } from "@/app/lib/agents";

describe("AgentStageRail", () => {
    beforeEach(() => act(() => endAgentRun()));

    it("renders nothing without a run", () => {
        const { container } = render(<AgentStageRail />);
        expect(container).toBeEmptyDOMElement();
    });

    it("shows stages and advances on Next stage", async () => {
        act(() => startAgentRun("due-diligence"));
        render(<AgentStageRail />);
        expect(screen.getByText("Intake")).toBeInTheDocument();
        expect(screen.getByText("Report")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Next stage" }));
        expect(getAgentRun()?.stage).toBe(1);
    });

    it("ends the run", async () => {
        act(() => startAgentRun("due-diligence"));
        render(<AgentStageRail />);
        await userEvent.click(screen.getByRole("button", { name: "End agent run" }));
        expect(getAgentRun()).toBeNull();
    });
});
