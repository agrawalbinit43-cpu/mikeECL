import type { Workflow } from "../shared/types";

export const PLAN_COMMAND_ID = "__ecl_plan__";

/**
 * The built-in /plan command. It sits in the slash menu beside the user's
 * workflows and turns plan mode on for the next message.
 */
export const PLAN_COMMAND: Workflow = {
    id: PLAN_COMMAND_ID,
    user_id: null,
    metadata: {
        title: "Plan",
        description:
            "Study the documents and the web, then show a plan before any work starts",
        type: "assistant",
        contributors: [],
        language: "en",
        version: null,
        practice: null,
        jurisdictions: null,
    },
    skill_md: null,
    columns_config: null,
    is_system: true,
    created_at: "1970-01-01T00:00:00.000Z",
} as Workflow;
