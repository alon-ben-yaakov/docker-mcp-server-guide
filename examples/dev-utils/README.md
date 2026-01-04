# 🛠️ Dev Utils MCP Server

A developer utilities MCP server with 17 tools for common development tasks - no more context-switching to online tools!

## Why This Server?

As developers, we constantly need to:
- Generate UUIDs for testing
- Hash passwords or verify checksums
- Encode/decode Base64 and URLs
- Convert timestamps between formats
- Format JSON for readability
- Test regex patterns
- Convert between color formats

This MCP server brings all these utilities directly into Claude, so you can stay in your workflow.

## Features

### 🔑 UUID & Hashing
| Tool | Description |
|------|-------------|
| `generate_uuid` | Generate one or more UUIDs (v4) |
| `hash` | Generate MD5, SHA1, SHA256, or SHA512 hashes |

### 📝 Encoding/Decoding
| Tool | Description |
|------|-------------|
| `base64_encode` | Encode text to Base64 |
| `base64_decode` | Decode Base64 to text |
| `url_encode` | URL encode a string |
| `url_decode` | URL decode a string |

### 🕐 Timestamps
| Tool | Description |
|------|-------------|
| `timestamp_now` | Get current time in multiple formats |
| `timestamp_convert` | Convert between Unix, ISO, and human-readable |

### 📋 JSON
| Tool | Description |
|------|-------------|
| `json_format` | Prettify/format JSON with custom indentation |
| `json_minify` | Minify JSON (remove whitespace) |

### 🔍 Regex
| Tool | Description |
|------|-------------|
| `regex_test` | Test a regex pattern against text |
| `regex_replace` | Replace matches using regex |

### 📝 String Utilities
| Tool | Description |
|------|-------------|
| `string_case` | Convert to camelCase, snake_case, kebab-case, etc. |
| `string_length` | Get character, word, line, and byte counts |

### 🎨 Colors
| Tool | Description |
|------|-------------|
| `color_convert` | Convert between HEX, RGB, and HSL |

### 🔢 Numbers
| Tool | Description |
|------|-------------|
| `number_convert` | Convert between decimal, binary, octal, hex |

### 📝 Generators
| Tool | Description |
|------|-------------|
| `lorem_ipsum` | Generate placeholder text |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with MCP Toolkit enabled

## Installation

```bash
# Navigate to the project
cd docker-mcp-server-guide/examples/dev-utils

# Build Docker image
docker build -t dev-utils-mcp .
```

## Configuration

### Step 1: Register with Docker MCP

```bash
# Import catalog (auto-creates 'custom' catalog)
docker mcp catalog import ./catalog-entry.yaml

# Enable the server
docker mcp server enable dev-utils
```

> **Verify (optional):** Run `docker mcp catalog ls` to see your catalog, and `docker mcp server ls` to see enabled servers.

### Step 2: Configure Claude Desktop (One-Time Setup)

If you haven't already configured Docker MCP gateway in Claude Desktop, see the [main guide](../../docs/CREATING-CUSTOM-DOCKER-MCP-SERVER.md#step-4-configure-claude-desktop) for setup instructions.

### Step 3: Restart Claude Desktop

Restart Claude Desktop to load the new server. You should now have access to all dev utility tools!

## Usage Examples

In Claude Desktop, you can ask:

- "Generate 5 UUIDs for my test data"
- "Hash this password with SHA256: mypassword123"
- "Encode this JSON to Base64"
- "What's the current Unix timestamp?"
- "Convert 1704067200 to a readable date"
- "Format this JSON: {\"name\":\"test\",\"value\":123}"
- "Test if this regex matches: pattern=\\d{3}-\\d{4} text=123-4567"
- "Convert 'Hello World' to snake_case"
- "Convert #FF5733 to RGB and HSL"
- "Convert 255 to binary and hex"
- "Generate 3 paragraphs of Lorem Ipsum"

## Development

### Local Testing

```bash
npm run dev

# Test MCP protocol
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

### Adding New Tools

1. Add the tool in `src/index.ts` using `server.tool()`
2. Rebuild: `npm run build`
3. Rebuild Docker: `docker build -t dev-utils-mcp .`
4. Update `catalog-entry.yaml` with the new tool name
5. Re-import: `docker mcp catalog import ./catalog-entry.yaml`
6. Restart Claude Desktop (close completely, end process in Task Manager if needed)

## License

MIT License
