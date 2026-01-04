# Catalog Templates

Templates for configuring Docker MCP catalog system.

## Files

| File | Destination | Purpose |
|------|-------------|---------|
| `custom.yaml.example` | `~/.docker/mcp/catalogs/custom.yaml` | Define your custom servers |
| `catalog.json.example` | `~/.docker/mcp/catalog.json` | Register catalogs to load |
| `registry.yaml.example` | `~/.docker/mcp/registry.yaml` | Enable/disable servers |

## Quick Setup

### Windows

```powershell
# Copy templates
Copy-Item custom.yaml.example $env:USERPROFILE\.docker\mcp\catalogs\custom.yaml

# Edit catalog.json (add custom catalog entry)
notepad $env:USERPROFILE\.docker\mcp\catalog.json

# Edit registry.yaml (enable your server)
notepad $env:USERPROFILE\.docker\mcp\registry.yaml
```

### macOS/Linux

```bash
# Copy templates
cp custom.yaml.example ~/.docker/mcp/catalogs/custom.yaml

# Edit catalog.json
nano ~/.docker/mcp/catalog.json

# Edit registry.yaml
nano ~/.docker/mcp/registry.yaml
```

## Important Notes

1. **Image name must match**: The `image:` field in custom.yaml must exactly match your `docker build -t <name>` tag
2. **Tool names must match**: List all tool names exactly as defined in your code
3. **Windows paths**: Use forward slashes in catalog.json URLs: `file:///C:/Users/...`
4. **Restart required**: Restart Claude Desktop after making changes
