# 🎲 Dice Roller MCP Server

A Model Context Protocol (MCP) server that provides comprehensive dice rolling mechanics for tabletop RPGs, board games, and any randomization needs.

## Purpose

This MCP server provides tools for rolling dice, flipping coins, and generating random selections - perfect for D&D, Pathfinder, World of Darkness, Fate, and any other tabletop gaming system.

## Features

### Available Tools

| Tool | Description |
|------|-------------|
| `roll_dice` | Roll dice using standard notation (e.g., "2d6", "1d20+5") |
| `coin_flip` | Flip one or more coins |
| `roll_advantage` | D&D advantage - roll 2d20, take highest |
| `roll_disadvantage` | D&D disadvantage - roll 2d20, take lowest |
| `roll_exploding` | Exploding dice - re-roll and add on max value |
| `roll_pool` | Dice pool with success counting (WoD, Shadowrun style) |
| `roll_fate` | Fate/Fudge dice (4dF) |
| `roll_percentile` | d100 with optional target number |
| `pick_random` | Pick random items from a list |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with MCP Toolkit enabled

## Installation

```bash
# Navigate to the project
cd docker-mcp-server-guide/examples/dice-roller

# Build Docker image
docker build -t dice-roller-mcp .
```

## Configuration

### Step 1: Register with Docker MCP

```bash
# Import catalog (auto-creates 'custom' catalog)
docker mcp catalog import ./catalog-entry.yaml

# Enable the server
docker mcp server enable dice-roller
```

> **Verify (optional):** Run `docker mcp catalog ls` to see your catalog, and `docker mcp server ls` to see enabled servers.

### Step 2: Configure Claude Desktop (One-Time Setup)

If you haven't already configured Docker MCP gateway in Claude Desktop:

#### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

#### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

#### Linux
Edit `~/.config/Claude/claude_desktop_config.json`:

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

### Step 3: Restart Claude Desktop

Restart Claude Desktop to load the new server:
1. Close Claude Desktop completely
2. If needed, open Task Manager and end any remaining `Claude.exe` processes
3. Reopen Claude Desktop

You should now have access to all dice rolling tools!

## Usage Examples

In your MCP client, you can ask:

- "Roll 2d6 for damage"
- "Roll a d20 with +5 modifier for my attack"
- "Flip a coin"
- "Roll with advantage for my perception check"
- "Roll 8d10 with target 8 for my Vampire dice pool"
- "Roll 4dF+3 for my Fate roll"
- "Roll percentile to see if I hit under 65"
- "Pick a random item from: sword, axe, bow, staff"
- "Roll 3d6 exploding for damage"

## Tool Details

### roll_dice
Standard dice notation with optional modifier.
```
Notation: "2d6", "1d20", "4d8"
Modifier: +5, -2, etc.
```

### coin_flip
Flip coins with heads/tails results.
```
Count: 1-100 coins
```

### roll_advantage / roll_disadvantage
D&D 5e style advantage/disadvantage rolls.
```
Modifier: Optional bonus/penalty
```

### roll_exploding
When you roll the maximum value, roll again and add!
```
Notation: "1d6", "2d10"
Max Explosions: 1-10 (default: 5)
```

### roll_pool
Count successes in a dice pool.
```
Count: Number of dice
Sides: Die type
Target: Success threshold
Count Ones: Treat 1s as botches
```

### roll_fate
Fate/Fudge dice (4dF) with +, -, and blank faces.
```
Modifier: Optional bonus
```

### roll_percentile
d100 roll with optional pass/fail check.
```
Target: Roll under this to succeed
```

### pick_random
Random selection from a list.
```
Items: ["option1", "option2", ...]
Count: How many to pick
```

## Development

### Local Testing

```bash
# Build and run
npm run dev

# Test MCP protocol
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

### Adding New Tools

1. Add the tool in `src/index.ts` using `server.tool()`
2. Rebuild with `npm run build`
3. Restart your MCP client

## Troubleshooting

### Tools Not Appearing
- Verify build completed successfully (`npm run build`)
- Check config path is correct and uses forward slashes
- Restart Claude Desktop completely

### Runtime Errors
- Check stderr output for error messages
- Verify Node.js version is 18+
- Ensure the dist/index.js file exists

## License

MIT License
