#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

// Add environment variables or configuration here
// const API_KEY = process.env.MY_API_KEY || "";

// ============================================================================
// Utility Functions
// ============================================================================

// Add your helper functions here

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new McpServer({
    name: "my-mcp-server",
    version: "1.0.0",
});

// ============================================================================
// Tools
// ============================================================================

// Example Tool 1: Simple greeting
server.tool(
    "greet",
    "Greet someone by name.",
    {
        name: z.string().describe("The name of the person to greet"),
    },
    async ({ name }) => {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `👋 Hello, ${name}! Welcome to my MCP server.`,
                },
            ],
        };
    }
);

// Example Tool 2: Tool with optional parameters
server.tool(
    "calculate",
    "Perform a simple calculation.",
    {
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
        operation: z
            .enum(["add", "subtract", "multiply", "divide"])
            .optional()
            .describe("Operation to perform (default: add)"),
    },
    async ({ a, b, operation = "add" }) => {
        let result: number;
        let symbol: string;

        switch (operation) {
            case "add":
                result = a + b;
                symbol = "+";
                break;
            case "subtract":
                result = a - b;
                symbol = "-";
                break;
            case "multiply":
                result = a * b;
                symbol = "×";
                break;
            case "divide":
                if (b === 0) {
                    return {
                        content: [
                            { type: "text" as const, text: "❌ Error: Cannot divide by zero" },
                        ],
                    };
                }
                result = a / b;
                symbol = "÷";
                break;
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🔢 ${a} ${symbol} ${b} = ${result}`,
                },
            ],
        };
    }
);

// Example Tool 3: Tool with error handling
server.tool(
    "fetch_data",
    "Fetch data from a source (example with error handling).",
    {
        source: z.string().describe("The data source to fetch from"),
    },
    async ({ source }) => {
        try {
            // Simulate fetching data
            // In a real server, you might use fetch() or a database call

            if (!source.trim()) {
                throw new Error("Source cannot be empty");
            }

            // Simulated result
            const data = {
                source,
                timestamp: new Date().toISOString(),
                status: "success",
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `📊 Data fetched successfully:\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// ============================================================================
// Add Your Own Tools Below
// ============================================================================

// server.tool(
//   "your_tool_name",
//   "Description of what your tool does.",
//   {
//     param1: z.string().describe("Description of param1"),
//     param2: z.number().optional().describe("Optional param2"),
//   },
//   async ({ param1, param2 = 0 }) => {
//     // Your tool logic here
//     return {
//       content: [
//         { type: "text" as const, text: `Result: ${param1}, ${param2}` },
//       ],
//     };
//   }
// );

// ============================================================================
// Start Server
// ============================================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 My MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
