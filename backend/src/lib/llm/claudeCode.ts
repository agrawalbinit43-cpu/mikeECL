import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import type { OpenAIToolSchema } from "./types";

/*
 * Claude subscription provider.
 *
 * ECL AI can run on the owner's own Claude Pro or Max login through the Claude
 * Code command line app installed on the same computer. No API key is
 * involved: the CLI holds the sign-in. This module resolves the CLI, builds
 * the model, and bridges ECL AI's own tools to it.
 *
 * Confidentiality guard. A Claude account can carry connectors (Gmail, Drive,
 * Docs) and the CLI ships file and shell tools. Client matters must never reach
 * them, so every run starts with all built-in tools off, the account connectors
 * off, project and user settings ignored, and only ECL AI's tools allowed.
 */

export const CLAUDE_CODE_MODEL_PREFIX = "claude-code/";
const MCP_SERVER_NAME = "ecl";
export const CLAUDE_CODE_TOOL_PREFIX = `mcp__${MCP_SERVER_NAME}__`;

export type ClaudeCodeModelOption = {
    id: string;
    label: string;
    group: "Claude subscription";
};

const MODELS: ClaudeCodeModelOption[] = [
    { id: "claude-code/opus", label: "Claude Opus (my subscription)", group: "Claude subscription" },
    { id: "claude-code/sonnet", label: "Claude Sonnet (my subscription)", group: "Claude subscription" },
    { id: "claude-code/haiku", label: "Claude Haiku (my subscription)", group: "Claude subscription" },
];

/** The alias the CLI understands for an ECL AI model id. */
export function claudeCodeModelAlias(model: string): string {
    const alias = model.replace(/^claude-code\/?/, "").trim();
    return alias || "sonnet";
}

export function isClaudeCodeModel(model: string): boolean {
    return model.startsWith(CLAUDE_CODE_MODEL_PREFIX);
}

function candidatePaths(): string[] {
    const home = homedir();
    return [
        process.env.ECL_CLAUDE_PATH?.trim() ?? "",
        path.join(home, ".local", "bin", "claude"),
        path.join(home, ".claude", "local", "claude"),
        "/opt/homebrew/bin/claude",
        "/usr/local/bin/claude",
    ].filter(Boolean);
}

let resolved: string | null | undefined;

/** Path to the installed Claude Code CLI, or null when it is not installed. */
export function findClaudeCli(): string | null {
    if (resolved !== undefined && (resolved === null || existsSync(resolved))) {
        return resolved;
    }
    resolved = candidatePaths().find((candidate) => existsSync(candidate)) ?? null;
    if (!resolved) {
        try {
            const out = execFileSync("/usr/bin/env", ["which", "claude"], {
                encoding: "utf8",
                timeout: 3_000,
                env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined },
            }).trim();
            if (out && existsSync(out)) resolved = out;
        } catch {
            /* not on PATH */
        }
    }
    return resolved ?? null;
}

export type ClaudeCodeStatus = {
    installed: boolean;
    signedIn: boolean;
    account?: string;
    detail: string;
};

/** Reads the CLI's sign-in state. Never throws. */
export function claudeCodeStatus(): ClaudeCodeStatus {
    const cli = findClaudeCli();
    if (!cli) {
        return {
            installed: false,
            signedIn: false,
            detail:
                "Claude Code is not installed on this computer. Install it from claude.com/claude-code, then sign in once.",
        };
    }
    try {
        const out = execFileSync(cli, ["auth", "status"], {
            encoding: "utf8",
            timeout: 8_000,
            env: cleanEnv(),
        });
        const parsed = JSON.parse(out) as {
            loggedIn?: boolean;
            authMethod?: string;
            email?: string;
        };
        if (parsed.loggedIn && parsed.authMethod === "claude.ai") {
            return {
                installed: true,
                signedIn: true,
                ...(parsed.email ? { account: parsed.email } : {}),
                detail: "Signed in with a Claude subscription.",
            };
        }
        return {
            installed: true,
            signedIn: false,
            detail: parsed.loggedIn
                ? "Claude Code is using an API key, not a subscription login. Run `claude auth login` and choose the Claude account option."
                : "Claude Code is installed but not signed in. Run `claude auth login` in Terminal.",
        };
    } catch {
        return {
            installed: true,
            signedIn: false,
            detail: "Could not read the Claude sign-in state. Run `claude auth login` in Terminal.",
        };
    }
}

export function listClaudeCodeModels(): ClaudeCodeModelOption[] {
    const status = claudeCodeStatus();
    return status.installed && status.signedIn ? MODELS : [];
}

/** Environment for the CLI: no Electron flag, no connectors, no API key. */
function cleanEnv(): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    // A stray key would make the CLI bill the API instead of the subscription.
    delete env.ANTHROPIC_API_KEY;
    delete env.ANTHROPIC_AUTH_TOKEN;
    env.ENABLE_CLAUDEAI_MCP_SERVERS = "false";
    env.CLAUDE_CODE_DISABLE_AUTO_MEMORY = "1";
    env.DISABLE_TELEMETRY = "1";
    return env;
}

function sandboxDir(): string {
    const dir = path.join(tmpdir(), "ecl-ai-claude-sandbox");
    mkdirSync(dir, { recursive: true });
    return dir;
}

import type * as AiSdk from "ai" with { "resolution-mode": "import" };
type AiSdkModule = typeof AiSdk;

/**
 * ECL AI's OpenAI-style tool schemas as AI SDK tools with Zod inputs, which is
 * what the CLI bridge needs. `execute` goes through the same batcher the other
 * providers use, so approvals, pauses and failures behave identically.
 */
export async function bridgeTools(
    schemas: OpenAIToolSchema[],
    execute: (name: string, input: Record<string, unknown>, id: string) => Promise<string>,
    sdk: Pick<AiSdkModule, "tool">,
) {
    const { z } = await import("zod");
    return Object.fromEntries(
        schemas.map((schema) => {
            const name = schema.function.name;
            const inputSchema = z.fromJSONSchema(
                schema.function.parameters as never,
            ) as never;
            return [
                name,
                sdk.tool({
                    description: schema.function.description,
                    inputSchema,
                    execute: (
                        input: Record<string, unknown>,
                        options?: { toolCallId?: string },
                    ) => execute(name, input ?? {}, options?.toolCallId ?? name),
                } as never),
            ];
        }),
    );
}

export async function createClaudeCodeModel(params: {
    model: string;
    tools?: Awaited<ReturnType<typeof bridgeTools>>;
    maxTurns: number;
}) {
    const cli = findClaudeCli();
    if (!cli) {
        throw new Error(
            "Claude Code is not installed on this computer, so the Claude subscription option is unavailable.",
        );
    }
    const { createClaudeCode, createAiSdkMcpServer } = await import(
        "ai-sdk-provider-claude-code"
    );
    const toolNames = Object.keys(params.tools ?? {});
    const provider = createClaudeCode({
        defaultSettings: {
            pathToClaudeCodeExecutable: cli,
            cwd: sandboxDir(),
            env: cleanEnv(),
            // Everything the CLI ships is off; only ECL AI's tools remain.
            tools: [],
            settingSources: [],
            persistSession: false,
            permissionPrompts: "none",
            verbatimPrompts: true,
            extraArgs: { "strict-mcp-config": null },
            maxTurns: params.maxTurns,
            ...(toolNames.length
                ? {
                      mcpServers: {
                          [MCP_SERVER_NAME]: createAiSdkMcpServer(
                              MCP_SERVER_NAME,
                              params.tools as never,
                          ),
                      },
                      allowedTools: toolNames.map(
                          (name) => `${CLAUDE_CODE_TOOL_PREFIX}${name}`,
                      ),
                  }
                : {}),
        } as never,
    });
    return provider(claudeCodeModelAlias(params.model)) as never;
}
