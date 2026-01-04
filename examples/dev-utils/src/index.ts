#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID, createHash } from "crypto";

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new McpServer({
    name: "dev-utils",
    version: "1.0.0",
});

// ============================================================================
// UUID Tools
// ============================================================================

server.tool(
    "generate_uuid",
    "Generate one or more UUIDs (v4).",
    {
        count: z.number().min(1).max(100).optional().describe("Number of UUIDs to generate (default: 1)"),
    },
    async ({ count = 1 }) => {
        const uuids = Array.from({ length: count }, () => randomUUID());

        if (count === 1) {
            return {
                content: [{ type: "text" as const, text: `🔑 ${uuids[0]}` }],
            };
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🔑 Generated ${count} UUIDs:\n${uuids.map((u, i) => `${i + 1}. ${u}`).join("\n")}`,
                },
            ],
        };
    }
);

// ============================================================================
// Hash Tools
// ============================================================================

server.tool(
    "hash",
    "Generate a hash of the input text using various algorithms.",
    {
        text: z.string().describe("Text to hash"),
        algorithm: z
            .enum(["md5", "sha1", "sha256", "sha512"])
            .optional()
            .describe("Hash algorithm (default: sha256)"),
    },
    async ({ text, algorithm = "sha256" }) => {
        const hash = createHash(algorithm).update(text).digest("hex");
        return {
            content: [
                {
                    type: "text" as const,
                    text: `🔐 ${algorithm.toUpperCase()}: ${hash}`,
                },
            ],
        };
    }
);

// ============================================================================
// Encoding Tools
// ============================================================================

server.tool(
    "base64_encode",
    "Encode text to Base64.",
    {
        text: z.string().describe("Text to encode"),
    },
    async ({ text }) => {
        const encoded = Buffer.from(text).toString("base64");
        return {
            content: [{ type: "text" as const, text: `📝 Base64 Encoded:\n${encoded}` }],
        };
    }
);

server.tool(
    "base64_decode",
    "Decode Base64 to text.",
    {
        encoded: z.string().describe("Base64 string to decode"),
    },
    async ({ encoded }) => {
        try {
            const decoded = Buffer.from(encoded, "base64").toString("utf-8");
            return {
                content: [{ type: "text" as const, text: `📝 Decoded:\n${decoded}` }],
            };
        } catch {
            return {
                content: [{ type: "text" as const, text: "❌ Invalid Base64 string" }],
            };
        }
    }
);

server.tool(
    "url_encode",
    "URL encode a string.",
    {
        text: z.string().describe("Text to URL encode"),
    },
    async ({ text }) => {
        const encoded = encodeURIComponent(text);
        return {
            content: [{ type: "text" as const, text: `🔗 URL Encoded:\n${encoded}` }],
        };
    }
);

server.tool(
    "url_decode",
    "URL decode a string.",
    {
        encoded: z.string().describe("URL encoded string to decode"),
    },
    async ({ encoded }) => {
        try {
            const decoded = decodeURIComponent(encoded);
            return {
                content: [{ type: "text" as const, text: `🔗 Decoded:\n${decoded}` }],
            };
        } catch {
            return {
                content: [{ type: "text" as const, text: "❌ Invalid URL encoded string" }],
            };
        }
    }
);

// ============================================================================
// Timestamp Tools
// ============================================================================

server.tool(
    "timestamp_now",
    "Get the current timestamp in various formats.",
    {},
    async () => {
        const now = new Date();
        const unix = Math.floor(now.getTime() / 1000);
        const unixMs = now.getTime();
        const iso = now.toISOString();
        const utc = now.toUTCString();
        const local = now.toLocaleString();

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🕐 Current Time:
• Unix (seconds): ${unix}
• Unix (milliseconds): ${unixMs}
• ISO 8601: ${iso}
• UTC: ${utc}
• Local: ${local}`,
                },
            ],
        };
    }
);

server.tool(
    "timestamp_convert",
    "Convert between timestamp formats.",
    {
        timestamp: z.string().describe("Timestamp to convert (Unix seconds, milliseconds, or ISO string)"),
    },
    async ({ timestamp }) => {
        let date: Date;

        // Try to parse as number (Unix timestamp)
        const num = Number(timestamp);
        if (!isNaN(num)) {
            // If it's a 13-digit number, treat as milliseconds
            if (timestamp.length === 13) {
                date = new Date(num);
            } else {
                // Otherwise treat as seconds
                date = new Date(num * 1000);
            }
        } else {
            // Try to parse as date string
            date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) {
            return {
                content: [{ type: "text" as const, text: "❌ Could not parse timestamp" }],
            };
        }

        const unix = Math.floor(date.getTime() / 1000);
        const unixMs = date.getTime();
        const iso = date.toISOString();
        const utc = date.toUTCString();
        const local = date.toLocaleString();
        const relative = getRelativeTime(date);

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🕐 Converted Timestamp:
• Unix (seconds): ${unix}
• Unix (milliseconds): ${unixMs}
• ISO 8601: ${iso}
• UTC: ${utc}
• Local: ${local}
• Relative: ${relative}`,
                },
            ],
        };
    }
);

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 0) {
        return `${Math.abs(diffSec)} seconds in the future`;
    } else if (diffSec < 60) {
        return `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
        return `${diffMin} minutes ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hours ago`;
    } else {
        return `${diffDay} days ago`;
    }
}

// ============================================================================
// JSON Tools
// ============================================================================

server.tool(
    "json_format",
    "Format/prettify a JSON string.",
    {
        json: z.string().describe("JSON string to format"),
        indent: z.number().min(1).max(8).optional().describe("Indentation spaces (default: 2)"),
    },
    async ({ json, indent = 2 }) => {
        try {
            const parsed = JSON.parse(json);
            const formatted = JSON.stringify(parsed, null, indent);
            return {
                content: [{ type: "text" as const, text: `📋 Formatted JSON:\n\`\`\`json\n${formatted}\n\`\`\`` }],
            };
        } catch (e) {
            return {
                content: [{ type: "text" as const, text: `❌ Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}` }],
            };
        }
    }
);

server.tool(
    "json_minify",
    "Minify a JSON string (remove whitespace).",
    {
        json: z.string().describe("JSON string to minify"),
    },
    async ({ json }) => {
        try {
            const parsed = JSON.parse(json);
            const minified = JSON.stringify(parsed);
            return {
                content: [{ type: "text" as const, text: `📋 Minified JSON:\n${minified}` }],
            };
        } catch (e) {
            return {
                content: [{ type: "text" as const, text: `❌ Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}` }],
            };
        }
    }
);

// ============================================================================
// Regex Tools
// ============================================================================

server.tool(
    "regex_test",
    "Test a regular expression against a string.",
    {
        pattern: z.string().describe("Regular expression pattern"),
        text: z.string().describe("Text to test against"),
        flags: z.string().optional().describe("Regex flags like 'gi' (default: 'g')"),
    },
    async ({ pattern, text, flags = "g" }) => {
        try {
            const regex = new RegExp(pattern, flags);
            const matches = text.match(regex);

            if (!matches || matches.length === 0) {
                return {
                    content: [{ type: "text" as const, text: `🔍 No matches found for pattern: /${pattern}/${flags}` }],
                };
            }

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `🔍 Pattern: /${pattern}/${flags}
✅ ${matches.length} match(es) found:
${matches.map((m, i) => `${i + 1}. "${m}"`).join("\n")}`,
                    },
                ],
            };
        } catch (e) {
            return {
                content: [{ type: "text" as const, text: `❌ Invalid regex: ${e instanceof Error ? e.message : "Error"}` }],
            };
        }
    }
);

server.tool(
    "regex_replace",
    "Replace matches in a string using a regular expression.",
    {
        pattern: z.string().describe("Regular expression pattern"),
        text: z.string().describe("Text to perform replacement on"),
        replacement: z.string().describe("Replacement string (supports $1, $2 for groups)"),
        flags: z.string().optional().describe("Regex flags (default: 'g')"),
    },
    async ({ pattern, text, replacement, flags = "g" }) => {
        try {
            const regex = new RegExp(pattern, flags);
            const result = text.replace(regex, replacement);

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `🔄 Regex Replace:
Pattern: /${pattern}/${flags}
Replacement: "${replacement}"

Result:
${result}`,
                    },
                ],
            };
        } catch (e) {
            return {
                content: [{ type: "text" as const, text: `❌ Invalid regex: ${e instanceof Error ? e.message : "Error"}` }],
            };
        }
    }
);

// ============================================================================
// String Tools
// ============================================================================

server.tool(
    "string_case",
    "Convert string to different cases.",
    {
        text: z.string().describe("Text to convert"),
        case: z
            .enum(["upper", "lower", "title", "camel", "snake", "kebab", "pascal"])
            .describe("Target case format"),
    },
    async ({ text, case: targetCase }) => {
        let result: string;

        switch (targetCase) {
            case "upper":
                result = text.toUpperCase();
                break;
            case "lower":
                result = text.toLowerCase();
                break;
            case "title":
                result = text.replace(/\w\S*/g, (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            case "camel":
                result = text
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
                break;
            case "snake":
                result = text
                    .replace(/\W+/g, " ")
                    .split(/ |\B(?=[A-Z])/)
                    .map((word) => word.toLowerCase())
                    .join("_");
                break;
            case "kebab":
                result = text
                    .replace(/\W+/g, " ")
                    .split(/ |\B(?=[A-Z])/)
                    .map((word) => word.toLowerCase())
                    .join("-");
                break;
            case "pascal":
                result = text
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                    .replace(/^./, (chr) => chr.toUpperCase());
                break;
        }

        return {
            content: [{ type: "text" as const, text: `📝 ${targetCase.toUpperCase()} case:\n${result}` }],
        };
    }
);

server.tool(
    "string_length",
    "Get detailed string statistics.",
    {
        text: z.string().describe("Text to analyze"),
    },
    async ({ text }) => {
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, "").length;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const lines = text.split(/\r?\n/).length;
        const bytes = Buffer.byteLength(text, "utf-8");

        return {
            content: [
                {
                    type: "text" as const,
                    text: `📊 String Statistics:
• Characters: ${chars}
• Characters (no spaces): ${charsNoSpaces}
• Words: ${words}
• Lines: ${lines}
• Bytes (UTF-8): ${bytes}`,
                },
            ],
        };
    }
);

// ============================================================================
// Color Tools
// ============================================================================

server.tool(
    "color_convert",
    "Convert colors between HEX, RGB, and HSL formats.",
    {
        color: z.string().describe("Color in HEX (#FF5733), RGB (rgb(255,87,51)), or HSL (hsl(11,100%,60%)) format"),
    },
    async ({ color }) => {
        let r: number, g: number, b: number;

        // Parse HEX
        const hexMatch = color.match(/^#?([a-fA-F0-9]{6})$/);
        if (hexMatch) {
            const hex = hexMatch[1];
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        // Parse RGB
        else if (color.match(/^rgb/i)) {
            const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (rgbMatch) {
                r = parseInt(rgbMatch[1]);
                g = parseInt(rgbMatch[2]);
                b = parseInt(rgbMatch[3]);
            } else {
                return { content: [{ type: "text" as const, text: "❌ Invalid RGB format" }] };
            }
        }
        // Parse HSL
        else if (color.match(/^hsl/i)) {
            const hslMatch = color.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
            if (hslMatch) {
                const h = parseInt(hslMatch[1]) / 360;
                const s = parseInt(hslMatch[2]) / 100;
                const l = parseInt(hslMatch[3]) / 100;
                const rgb = hslToRgb(h, s, l);
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
            } else {
                return { content: [{ type: "text" as const, text: "❌ Invalid HSL format" }] };
            }
        }
        else {
            return { content: [{ type: "text" as const, text: "❌ Unrecognized color format. Use HEX, RGB, or HSL." }] };
        }

        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hsl = rgbToHsl(r, g, b);

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🎨 Color Conversion:
• HEX: ${hex}
• RGB: ${rgb}
• HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                },
            ],
        };
    }
);

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ============================================================================
// Number Tools
// ============================================================================

server.tool(
    "number_convert",
    "Convert numbers between decimal, binary, octal, and hexadecimal.",
    {
        number: z.string().describe("Number to convert (prefix with 0b for binary, 0o for octal, 0x for hex)"),
    },
    async ({ number }) => {
        let decimal: number;

        if (number.startsWith("0b") || number.startsWith("0B")) {
            decimal = parseInt(number.slice(2), 2);
        } else if (number.startsWith("0o") || number.startsWith("0O")) {
            decimal = parseInt(number.slice(2), 8);
        } else if (number.startsWith("0x") || number.startsWith("0X")) {
            decimal = parseInt(number.slice(2), 16);
        } else {
            decimal = parseInt(number, 10);
        }

        if (isNaN(decimal)) {
            return { content: [{ type: "text" as const, text: "❌ Invalid number format" }] };
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: `🔢 Number Conversion:
• Decimal: ${decimal}
• Binary: 0b${decimal.toString(2)}
• Octal: 0o${decimal.toString(8)}
• Hexadecimal: 0x${decimal.toString(16).toUpperCase()}`,
                },
            ],
        };
    }
);

// ============================================================================
// Lorem Ipsum Generator
// ============================================================================

server.tool(
    "lorem_ipsum",
    "Generate Lorem Ipsum placeholder text.",
    {
        type: z.enum(["words", "sentences", "paragraphs"]).describe("Type of content to generate"),
        count: z.number().min(1).max(100).describe("Number of words/sentences/paragraphs"),
    },
    async ({ type, count }) => {
        const words = [
            "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
            "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
            "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
            "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
            "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
            "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
            "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
            "deserunt", "mollit", "anim", "id", "est", "laborum"
        ];

        const getRandomWords = (n: number): string => {
            return Array.from({ length: n }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
        };

        const getSentence = (): string => {
            const wordCount = Math.floor(Math.random() * 10) + 5;
            const sentence = getRandomWords(wordCount);
            return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
        };

        const getParagraph = (): string => {
            const sentenceCount = Math.floor(Math.random() * 4) + 3;
            return Array.from({ length: sentenceCount }, getSentence).join(" ");
        };

        let result: string;

        switch (type) {
            case "words":
                result = getRandomWords(count);
                break;
            case "sentences":
                result = Array.from({ length: count }, getSentence).join(" ");
                break;
            case "paragraphs":
                result = Array.from({ length: count }, getParagraph).join("\n\n");
                break;
        }

        return {
            content: [{ type: "text" as const, text: `📝 Lorem Ipsum (${count} ${type}):\n\n${result}` }],
        };
    }
);

// ============================================================================
// Start Server
// ============================================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🛠️ Dev Utils MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
