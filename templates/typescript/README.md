# My MCP Server

A custom MCP server template.

## Quick Start

```bash
# Build Docker image
docker build -t my-mcp-server .
```

## Tools

| Tool | Description |
|------|-------------|
| `greet` | Greet someone by name |
| `calculate` | Perform simple calculations |
| `fetch_data` | Example of error handling |

## Customization

1. Edit `src/index.ts` to add your own tools
2. Update `package.json` with your server name
3. Rebuild and redeploy

## Register with Docker MCP

```bash
# Import catalog (auto-creates 'custom' catalog)
docker mcp catalog import ./catalog-entry.yaml

# Enable the server
docker mcp server enable my-server
```

> **Verify (optional):** Run `docker mcp catalog ls` and `docker mcp server ls`

Then restart Claude Desktop (close completely, end process in Task Manager if needed)!

For more details, see the [full guide](../../docs/CREATING-CUSTOM-DOCKER-MCP-SERVER.md).
