"use client";

import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

/** The plan prompt ends with this line; it marks a turn that awaits approval. */
export const PLAN_SENTINEL = /reply ['"“‘]?go ahead['"”’]? to run this plan/i;

export function awaitsPlanApproval(text: string): boolean {
    return PLAN_SENTINEL.test(text);
}

interface Props {
    onApprove: () => void;
    onRevise: (note: string) => void;
}

/**
 * Shown under a finished plan. Approving runs the plan; revising sends a note
 * and asks for an updated plan first.
 */
export function PlanApprovalBar({ onApprove, onRevise }: Props) {
    const [revising, setRevising] = useState(false);
    const [note, setNote] = useState("");

    return (
        <div
            role="group"
            aria-label="Plan approval"
            className="my-4 rounded-md border border-border bg-[#fffdf9] p-4"
        >
            <div className="flex items-start gap-3">
                <ClipboardCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-ecl-gold-deep"
                    aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ecl-ink">
                        The plan is ready for your review
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                        Nothing has been drafted yet. Approve to run it, or
                        change it first.
                    </p>
                    {revising && (
                        <div className="mt-3">
                            <label
                                htmlFor="plan-revision-note"
                                className="sr-only"
                            >
                                What should change in the plan
                            </label>
                            <textarea
                                id="plan-revision-note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                placeholder="For example: add the RBI angle, and keep the memo to two pages."
                                className="w-full resize-none rounded-md border border-[#d6cfc5] bg-[#fffdf9] px-3 py-2 text-sm focus-visible:border-ecl-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/40"
                            />
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {revising ? (
                            <>
                                <button
                                    type="button"
                                    disabled={!note.trim()}
                                    onClick={() => onRevise(note.trim())}
                                    className="h-9 rounded-md bg-ecl-maroon px-4 text-sm font-medium text-white transition-colors hover:bg-ecl-maroon-ink disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/60"
                                >
                                    Update plan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevising(false)}
                                    className="h-9 rounded-md border border-[#d6cfc5] px-4 text-sm text-gray-700 hover:bg-[#f6f0e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/60"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onApprove}
                                    className="h-9 rounded-md bg-ecl-maroon px-4 text-sm font-medium text-white transition-colors hover:bg-ecl-maroon-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/60"
                                >
                                    Approve and run
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevising(true)}
                                    className="h-9 rounded-md border border-[#d6cfc5] px-4 text-sm text-gray-700 hover:bg-[#f6f0e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/60"
                                >
                                    Change the plan
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
