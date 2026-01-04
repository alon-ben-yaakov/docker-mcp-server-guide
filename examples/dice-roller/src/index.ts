#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ============================================================================
// Dice Utilities
// ============================================================================

function roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

function rollMultiple(count: number, sides: number): number[] {
    return Array.from({ length: count }, () => roll(sides));
}

function sum(values: number[]): number {
    return values.reduce((a, b) => a + b, 0);
}

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new McpServer({
    name: "dice-roller",
    version: "1.0.0",
});

// ============================================================================
// Tools
// ============================================================================

// Roll Dice - Standard dice notation (XdY)
server.tool(
    "roll_dice",
    "Roll dice using standard notation (e.g., '2d6' for two six-sided dice). Optionally add a modifier.",
    {
        notation: z
            .string()
            .describe("Dice notation like '1d20', '2d6', '4d8', etc."),
        modifier: z
            .number()
            .optional()
            .describe("Optional modifier to add/subtract from total (e.g., +5 or -2)"),
    },
    async ({ notation, modifier = 0 }) => {
        const match = notation.toLowerCase().match(/^(\d+)d(\d+)$/);
        if (!match) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Invalid dice notation: "${notation}". Use format like "2d6" or "1d20".`,
                    },
                ],
            };
        }

        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);

        if (count < 1 || count > 100) {
            return {
                content: [
                    { type: "text" as const, text: "Dice count must be between 1 and 100." },
                ],
            };
        }
        if (sides < 2 || sides > 1000) {
            return {
                content: [
                    { type: "text" as const, text: "Dice sides must be between 2 and 1000." },
                ],
            };
        }

        const rolls = rollMultiple(count, sides);
        const total = sum(rolls) + modifier;
        const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : "";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎲 Rolling ${notation}${modifierStr}\nRolls: [${rolls.join(", ")}]\nTotal: ${total}`,
                },
            ],
        };
    }
);

// Coin Flip
server.tool(
    "coin_flip",
    "Flip a coin. Returns heads or tails.",
    {
        count: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe("Number of coins to flip (default: 1)"),
    },
    async ({ count = 1 }) => {
        const flips = Array.from({ length: count }, () =>
            Math.random() < 0.5 ? "Heads" : "Tails"
        );
        const heads = flips.filter((f) => f === "Heads").length;
        const tails = flips.filter((f) => f === "Tails").length;

        if (count === 1) {
            return {
                content: [
                    { type: "text" as const, text: `🪙 ${flips[0]}!` },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🪙 Flipping ${count} coins:\nResults: ${flips.join(", ")}\nHeads: ${heads} | Tails: ${tails}`,
                },
            ],
        };
    }
);

// Roll with Advantage (D&D style)
server.tool(
    "roll_advantage",
    "Roll with advantage (D&D style): Roll 2d20 and take the higher result.",
    {
        modifier: z
            .number()
            .optional()
            .describe("Optional modifier to add to the result"),
    },
    async ({ modifier = 0 }) => {
        const rolls = rollMultiple(2, 20);
        const best = Math.max(...rolls);
        const total = best + modifier;
        const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : "";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎲 Rolling with Advantage${modifierStr}\nRolls: [${rolls.join(", ")}]\nTaking highest: ${best}\nTotal: ${total}`,
                },
            ],
        };
    }
);

// Roll with Disadvantage (D&D style)
server.tool(
    "roll_disadvantage",
    "Roll with disadvantage (D&D style): Roll 2d20 and take the lower result.",
    {
        modifier: z
            .number()
            .optional()
            .describe("Optional modifier to add to the result"),
    },
    async ({ modifier = 0 }) => {
        const rolls = rollMultiple(2, 20);
        const worst = Math.min(...rolls);
        const total = worst + modifier;
        const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : "";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎲 Rolling with Disadvantage${modifierStr}\nRolls: [${rolls.join(", ")}]\nTaking lowest: ${worst}\nTotal: ${total}`,
                },
            ],
        };
    }
);

// Exploding Dice
server.tool(
    "roll_exploding",
    "Roll exploding dice: When you roll the maximum value, roll again and add it!",
    {
        notation: z
            .string()
            .describe("Dice notation like '1d6' or '2d10'"),
        maxExplosions: z
            .number()
            .min(1)
            .max(10)
            .optional()
            .describe("Maximum number of explosions per die (default: 5)"),
    },
    async ({ notation, maxExplosions = 5 }) => {
        const match = notation.toLowerCase().match(/^(\d+)d(\d+)$/);
        if (!match) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Invalid dice notation: "${notation}". Use format like "2d6".`,
                    },
                ],
            };
        }

        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);

        if (count < 1 || count > 20) {
            return {
                content: [
                    { type: "text" as const, text: "Dice count must be between 1 and 20 for exploding dice." },
                ],
            };
        }

        const allRolls: number[][] = [];
        let grandTotal = 0;

        for (let i = 0; i < count; i++) {
            const dieRolls: number[] = [];
            let currentRoll = roll(sides);
            dieRolls.push(currentRoll);
            let explosions = 0;

            while (currentRoll === sides && explosions < maxExplosions) {
                currentRoll = roll(sides);
                dieRolls.push(currentRoll);
                explosions++;
            }

            allRolls.push(dieRolls);
            grandTotal += sum(dieRolls);
        }

        const rollsDisplay = allRolls
            .map((rolls, i) => `  Die ${i + 1}: [${rolls.join(" → ")}]${rolls.length > 1 ? " 💥" : ""}`)
            .join("\n");

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎲💥 Rolling ${notation} (exploding!)\n${rollsDisplay}\nTotal: ${grandTotal}`,
                },
            ],
        };
    }
);

// Dice Pool (count successes)
server.tool(
    "roll_pool",
    "Roll a dice pool and count successes. Great for systems like World of Darkness, Shadowrun, etc.",
    {
        count: z.number().min(1).max(50).describe("Number of dice to roll"),
        sides: z.number().min(2).max(100).describe("Number of sides per die"),
        target: z.number().describe("Target number - rolls >= this count as success"),
        countOnes: z
            .boolean()
            .optional()
            .describe("If true, count 1s as negative successes (botches)"),
    },
    async ({ count, sides, target, countOnes = false }) => {
        const rolls = rollMultiple(count, sides);
        const successes = rolls.filter((r) => r >= target).length;
        const ones = countOnes ? rolls.filter((r) => r === 1).length : 0;
        const netSuccesses = successes - ones;

        let result = `🎲 Rolling ${count}d${sides} (target: ${target}+)\nRolls: [${rolls.join(", ")}]\nSuccesses: ${successes}`;

        if (countOnes) {
            result += `\nBotches (1s): ${ones}\nNet Successes: ${netSuccesses}`;
        }

        return {
            content: [{ type: "text" as const, text: result }],
        };
    }
);

// Fudge/Fate Dice
server.tool(
    "roll_fate",
    "Roll Fate/Fudge dice (4dF). Each die shows +, -, or blank.",
    {
        modifier: z
            .number()
            .optional()
            .describe("Optional modifier to add to the result"),
    },
    async ({ modifier = 0 }) => {
        const symbols = ["-", " ", "+"];
        const values = [-1, 0, 1];

        const rolls = Array.from({ length: 4 }, () => {
            const idx = Math.floor(Math.random() * 3);
            return { symbol: symbols[idx], value: values[idx] };
        });

        const total = sum(rolls.map((r) => r.value)) + modifier;
        const display = rolls.map((r) => `[${r.symbol}]`).join(" ");
        const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : "";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎲 Rolling 4dF${modifierStr}\n${display}\nTotal: ${total >= 0 ? "+" : ""}${total}`,
                },
            ],
        };
    }
);

// Percentile Roll (d100)
server.tool(
    "roll_percentile",
    "Roll percentile dice (d100). Great for percentage-based checks.",
    {
        target: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional target to roll under for success"),
    },
    async ({ target }) => {
        const result = roll(100);

        let text = `🎲 Rolling d100: ${result}`;
        if (target !== undefined) {
            const success = result <= target;
            text += `\nTarget: ${target} or under\nResult: ${success ? "✅ Success!" : "❌ Failure"}`;
        }

        return {
            content: [{ type: "text" as const, text }],
        };
    }
);

// Pick Random
server.tool(
    "pick_random",
    "Pick a random item from a list. Great for random tables, encounters, etc.",
    {
        items: z.array(z.string()).min(1).describe("List of items to choose from"),
        count: z
            .number()
            .min(1)
            .optional()
            .describe("Number of items to pick (default: 1)"),
    },
    async ({ items, count = 1 }) => {
        if (count > items.length) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Cannot pick ${count} items from a list of ${items.length}.`,
                    },
                ],
            };
        }

        const shuffled = [...items].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, count);

        if (count === 1) {
            return {
                content: [
                    { type: "text" as const, text: `🎯 Picked: ${picked[0]}` },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎯 Picked ${count} items:\n${picked.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}`,
                },
            ],
        };
    }
);

// ============================================================================
// Start Server
// ============================================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🎲 Dice Roller MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
