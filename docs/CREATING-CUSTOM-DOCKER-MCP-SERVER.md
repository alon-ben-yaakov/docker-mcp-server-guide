# 🐳 Creating a Custom Docker MCP Server for Claude Desktop

A complete guide to building, containerizing, and deploying your own MCP (Model Context Protocol) server using Docker Desktop's MCP integration.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create the MCP Server Project](#step-1-create-the-mcp-server-project)
3. [Dockerize the Server](#step-2-dockerize-the-server)
4. [Register in Docker MCP Catalog System](#step-3-register-in-docker-mcp-catalog-system)
5. [Configure Claude Desktop](#step-4-configure-claude-desktop)
6. [Troubleshooting](#troubleshooting)
7. [Quick Reference](#quick-reference)

---

## Prerequisites

### 1. Install Docker Desktop

Download and install Docker Desktop from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).

Ensure Docker is running before proceeding.

### 2. Activate Docker Beta Feature - MCP Server

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Navigate to **Features in development** → **Beta features**
4. Enable **"Docker MCP Server"** or **"MCP Toolkit"**
5. Click **Apply & Restart**

### 3. Connect Docker MCP to Claude Desktop

1. In Docker Desktop, go to **Settings** → **MCP** (or **MCP Toolkit**)
2. Click on the **Clients** tab
3. Find **Claude Desktop** and click **Connect**
4. This automatically updates your Claude Desktop config file at:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

Your Claude config should now look like this:

```json
{
    "mcpServers": {
        "MCP_DOCKER": {
            "command": "docker",
            "args": [
                "mcp",
                "gateway",
                "run"
            ],
            "env": {
                "LOCALAPPDATA": "C:\\Users\\YourUsername\\AppData\\Local",
                "ProgramData": "C:\\ProgramData",
                "ProgramFiles": "C:\\Program Files"
            }
        }
    }
}
```

---

## Step 1: Create the MCP Server Project

### 1.1 Initialize the Project

```powershell
# Create project directory
mkdir my-mcp-server
cd my-mcp-server

# Initialize npm project
npm init -y
```

### 1.2 Create package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "My custom MCP server",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

### 1.3 Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 Create src/index.ts

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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

// Example tool - replace with your own!
server.tool(
  "my_tool",
  "Description of what this tool does.",
  {
    param1: z.string().describe("First parameter"),
    param2: z.number().optional().describe("Optional second parameter"),
  },
  async ({ param1, param2 = 0 }) => {
    try {
      // Your tool logic here
      const result = `Processed: ${param1}, ${param2}`;
      
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ ${result}`,
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
```

### 1.5 Install Dependencies and Build

```powershell
npm install
npm run build
```

### 1.6 Test Locally (Optional)

```powershell
# Test that MCP protocol works
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

---

## Step 2: Dockerize the Server

### 2.1 Create Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
# Use Node.js LTS image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDeps for build
RUN npm ci --include=dev

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Use the existing node user (UID 1000)
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Run the server
CMD ["node", "dist/index.js"]
```

### 2.2 Create .dockerignore (Optional but Recommended)

```
node_modules/
dist/
.git/
*.log
```

### 2.3 Build the Docker Image

```powershell
docker build -t my-mcp-server .
```

⚠️ **Important**: The image tag name (e.g., `my-mcp-server`) must match what you put in the catalog YAML file later!

### 2.4 Verify the Image

```powershell
docker images | findstr my-mcp-server
```

---

## Step 3: Register in Docker MCP Catalog System

Docker MCP uses a catalog system to know which servers are available. You can register your server using commands or by manually editing files.

### Option A: Using Docker MCP Commands (Recommended)

This is the simplest approach - just two commands!

#### 3.1 Create a Catalog Entry File

Create a `catalog-entry.yaml` file in your project directory:

```yaml
version: 2
name: custom
displayName: Custom MCP Servers
registry:
  my-mcp-server:
    description: "Description of your MCP server"
    title: "My MCP Server"
    type: server
    image: my-mcp-server:latest
    ref: ""
    readme: ""
    toolsUrl: ""
    source: ""
    upstream: ""
    icon: ""
    tools:
      - name: my_tool
      # Add all your tool names here
    secrets: []
    metadata:
      category: other
      tags:
        - custom
```

#### 3.2 Register the Server

```bash
# Import catalog (auto-creates 'custom' catalog and enables the server)
docker mcp catalog import ./catalog-entry.yaml
```

**Verify (optional):**
```bash
# Check catalog was created
docker mcp catalog ls
# Expected: custom: Custom MCP Servers

# Check server is enabled
docker mcp server ls
# Expected: my-mcp-server (and any other enabled servers)
```

That's it! Your server is now registered. Skip to [Step 4](#step-4-configure-claude-desktop).

---

### Option B: Manual File Configuration

If you prefer to manage the files directly, or need more control over the catalog structure:

#### 3.1 Locate Your Docker MCP Config Directory

- **Windows**: `C:\Users\<YourUsername>\.docker\mcp\`
- **macOS**: `~/.docker/mcp/`
- **Linux**: `~/.docker/mcp/`

The structure looks like:
```
.docker/mcp/
├── catalog.json          # List of catalogs to load
├── config.yaml           # General config (usually empty)
├── registry.yaml         # Which servers are enabled
├── tools.yaml            # Tool-specific settings (usually empty)
└── catalogs/
    ├── docker-mcp.yaml   # Official Docker MCP catalog
    └── custom.yaml       # Your custom catalog (create this!)
```

### 3.2 Create Custom Catalog YAML

Create `~/.docker/mcp/catalogs/custom.yaml`:

```yaml
version: 2
name: custom
displayName: Custom MCP Servers
registry:
  my-mcp-server:
    description: "Description of your MCP server"
    title: "My MCP Server"
    type: server
    dateAdded: "2026-01-03T00:00:00Z"
    image: my-mcp-server:latest
    ref: ""
    readme: ""
    toolsUrl: ""
    source: ""
    upstream: ""
    icon: ""
    tools:
      - name: my_tool
      # Add all your tool names here
    secrets: []
    metadata:
      category: other
      tags:
        - custom
        - your-tags
      license: MIT
      owner: local
```

**Key fields to customize:**
- `my-mcp-server` - The registry key (must be unique)
- `description` - What your server does
- `title` - Display name
- `image` - Must match your Docker image tag exactly!
- `tools` - List all tool names from your code

### 3.3 Register the Catalog in catalog.json

Edit `~/.docker/mcp/catalog.json` to add your custom catalog:

```json
{
  "catalogs": {
    "docker-mcp": {
      "displayName": "Docker MCP Catalog",
      "url": "https://desktop.docker.com/mcp/catalog/v2/catalog.yaml",
      "lastUpdate": "2026-01-03T00:00:00+00:00"
    },
    "custom": {
      "displayName": "Custom MCP Servers",
      "url": "file:///C:/Users/YourUsername/.docker/mcp/catalogs/custom.yaml",
      "lastUpdate": "2026-01-03T00:00:00+00:00"
    }
  }
}
```

**For Windows paths in the URL:**
- Use forward slashes: `file:///C:/Users/...`
- Or escape backslashes: `file:///C:\\Users\\...`

### 3.4 Enable the Server in registry.yaml

Edit `~/.docker/mcp/registry.yaml` to enable your server:

```yaml
registry:
  my-mcp-server:
    ref: ""
  # ... other servers you have enabled
```

---

## Step 4: Configure Claude Desktop

### 4.1 Verify Docker MCP Gateway Configuration

Your Claude Desktop config should already be set up from the prerequisites. If not, ensure it contains:

```json
{
    "mcpServers": {
        "MCP_DOCKER": {
            "command": "docker",
            "args": [
                "mcp",
                "gateway",
                "run"
            ]
        }
    }
}
```

### 4.2 Test the Gateway

Run the gateway manually to verify everything is configured:

```powershell
docker mcp gateway run
```

You should see output like:
```
- Reading configuration...
  - Reading registry from registry.yaml
  - Reading catalog from [docker-mcp.yaml, custom.yaml]    # ← custom.yaml should appear!
  ...
- Those servers are enabled: my-mcp-server, ...
  > my-mcp-server: (X tools)                               # ← Your tools should list!
```

### 4.3 Restart Claude Desktop

1. **Fully quit** Claude Desktop (system tray → Quit)
2. **Reopen** Claude Desktop
3. Your new tools should now be available! 🎉

---

## Troubleshooting

### "MCP server not found: my-mcp-server"

**Cause**: The catalog isn't being loaded.

**Fix**: 
1. Check `catalog.json` includes your custom catalog with correct file path
2. Verify the URL format: `file:///C:/Users/...` (forward slashes!)
3. Ensure the YAML is valid (no syntax errors)

### "catalog from [docker-mcp.yaml]" (custom.yaml missing)

**Cause**: `catalog.json` doesn't include your custom catalog.

**Fix**: Add the `"custom"` entry to `catalog.json` as shown in Step 3.3.

### Image not found / Container won't start

**Cause**: Docker image doesn't exist or name mismatch.

**Fix**:
```powershell
# Check image exists
docker images | findstr my-mcp-server

# Rebuild if needed
docker build -t my-mcp-server .
```

Ensure the image name in your catalog YAML matches exactly!

### Tools not appearing in Claude

**Fix**:
1. Restart Claude Desktop completely (Quit, not just close)
2. Check `docker mcp gateway run` output for errors
3. Verify the server is listed in `registry.yaml`

### "useradd: UID 1000 is not unique"

**Cause**: The node:20-slim image already has a user with UID 1000.

**Fix**: Use the existing `node` user instead of creating a new one:
```dockerfile
RUN chown -R node:node /app
USER node
```

### "tsc: not found" during Docker build

**Cause**: TypeScript not installed when building.

**Fix**: Use `npm ci --include=dev` instead of just `npm ci` to include dev dependencies during build.

### Windows: Claude Desktop Not Showing New Server

**Cause**: Claude Desktop or Docker MCP gateway process still running in background.

**Fix**:
1. Open **Task Manager** (Ctrl + Shift + Esc)
2. Find and end these processes:
   - `Claude.exe`
   - Any `docker` processes related to MCP gateway
3. Restart Docker Desktop
4. Restart Claude Desktop

Sometimes Windows doesn't fully close Claude Desktop when you click "Quit" - it may still run in the background. Task Manager is the reliable way to ensure a clean restart.

### Server appears in gateway but tools don't work

**Cause**: Container might be failing silently.

**Fix**: Test the container directly:
```powershell
# Run container interactively to see errors
docker run -it --rm my-mcp-server

# Check if the image runs at all
docker run --rm my-mcp-server node --version
```

---

## Debugging with Docker MCP Commands

Docker MCP provides several commands to help debug your setup:

### List All Available Servers

```powershell
docker mcp server list
```

Shows all servers from all loaded catalogs. Your custom server should appear here.

### Check Gateway Status

```powershell
docker mcp gateway run
```

This runs the gateway in the foreground and shows detailed output:
- Which catalogs are loaded
- Which servers are enabled
- How many tools each server provides
- Any errors during initialization

**Expected output:**
```
- Reading configuration...
  - Reading registry from registry.yaml
  - Reading catalog from [docker-mcp.yaml, custom.yaml]
  - Reading config from config.yaml
  - Reading tools from tools.yaml
- Configuration read in 500ms
- Using images:
  - my-mcp-server:latest
> Images pulled in 5ms
- Those servers are enabled: my-mcp-server, obsidian
- Listing MCP tools...
  > my-mcp-server: (3 tools)
  > obsidian: (12 tools)
> 15 tools listed in 1.5s
```

### View Docker MCP Configuration

```powershell
# Check what's in your registry
type $env:USERPROFILE\.docker\mcp\registry.yaml

# Check catalog.json
type $env:USERPROFILE\.docker\mcp\catalog.json

# Validate your custom catalog YAML
type $env:USERPROFILE\.docker\mcp\catalogs\custom.yaml
```

### Test Container Directly

```powershell
# List your MCP images
docker images | findstr mcp

# Run container and send MCP command
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | docker run -i --rm my-mcp-server

# Check container logs if running
docker ps  # Find container ID
docker logs <container_id>
```

### Common Debug Workflow

1. **Verify image exists**: `docker images | findstr my-mcp-server`
2. **Check gateway loads it**: `docker mcp gateway run` (look for your server name)
3. **Verify registry entry**: Check `registry.yaml` has your server
4. **Check catalog entry**: Verify `custom.yaml` has correct image name
5. **Test container directly**: `docker run -it --rm my-mcp-server`
6. **Kill everything and restart**: Task Manager → End Claude + Docker → Restart both

---

## Quick Reference

### File Locations (Windows)

| File | Path |
|------|------|
| Claude Config | `%APPDATA%\Claude\claude_desktop_config.json` |
| Docker MCP Dir | `%USERPROFILE%\.docker\mcp\` |
| Catalogs | `%USERPROFILE%\.docker\mcp\catalogs\` |
| Custom Catalog | `%USERPROFILE%\.docker\mcp\catalogs\custom.yaml` |
| Catalog Registry | `%USERPROFILE%\.docker\mcp\catalog.json` |
| Server Registry | `%USERPROFILE%\.docker\mcp\registry.yaml` |

### Essential Commands

```powershell
# Build Docker image
docker build -t my-mcp-server .

# List images
docker images | findstr my-mcp-server

# Test gateway
docker mcp gateway run

# List registered servers
docker mcp server list
```

### Adding a New Server (Checklist)

- [ ] Create TypeScript MCP server with tools
- [ ] Build locally: `npm run build`
- [ ] Create Dockerfile
- [ ] Build image: `docker build -t server-name .`
- [ ] Add to `catalogs/custom.yaml`
- [ ] Update `catalog.json` (if first custom server)
- [ ] Add to `registry.yaml`
- [ ] Restart Claude Desktop

---

## Example: Dice Roller Server

For a complete working example, see the `dice-roller-server` project in this directory, which implements:

- `roll_dice` - Standard dice notation (2d6, 1d20+5)
- `coin_flip` - Flip coins
- `roll_advantage` / `roll_disadvantage` - D&D style rolls
- `roll_exploding` - Exploding dice mechanics
- `roll_pool` - Dice pool with success counting
- `roll_fate` - Fate/Fudge dice
- `roll_percentile` - d100 rolls
- `pick_random` - Random selection from a list

---

*Last updated: January 3, 2026*
