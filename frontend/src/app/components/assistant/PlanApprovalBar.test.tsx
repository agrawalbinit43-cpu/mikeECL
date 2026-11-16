import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlanApprovalBar, awaitsPlanApproval } from "./PlanApprovalBar";

describe("PlanApprovalBar", () => {
    it("detects the approval line the plan ends with", () => {
        expect(
            awaitsPlanApproval("Reply 'go ahead' to run this plan, or tell me what to change."),
        ).toBe(true);
        expect(awaitsPlanApproval("Here is the memo.")).toBe(false);
    });

    it("approves in one click", async () => {
        const onApprove = vi.fn();
        render(<PlanApprovalBar onApprove={onApprove} onRevise={vi.fn()} />);
        await userEvent.click(screen.getByRole("button", { name: "Approve and run" }));
        expect(onApprove).toHaveBeenCalled();
    });

    it("sends a revision note", async () => {
        const onRevise = vi.fn();
        render(<PlanApprovalBar onApprove={vi.fn()} onRevise={onRevise} />);
        await userEvent.click(screen.getByRole("button", { name: "Change the plan" }));
        await userEvent.type(screen.getByLabelText(/what should change/i), "Add RBI angle");
        await userEvent.click(screen.getByRole("button", { name: "Update plan" }));
        expect(onRevise).toHaveBeenCalledWith("Add RBI angle");
    });
});
