# 🐳 Docker MCP Server Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://www.docker.com/products/docker-desktop/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

A complete guide to building custom MCP (Model Context Protocol) servers using Docker Desktop's MCP integration for Claude Desktop.

<!-- Add a screenshot here: ![Demo](assets/demo.png) -->

---

## 🤔 Why Docker MCP?

| Benefit | Description |
|---------|-------------|
| **🔒 Isolation** | Each server runs in its own container - no dependency conflicts |
| **📦 Portability** | Build once, run anywhere Docker runs |
| **🛡️ Security** | Containers run as non-root with limited permissions |
| **🚫 No Local Setup** | No need to install Node.js or dependencies on your machine |
| **🔄 Easy Updates** | Rebuild image to update, rollback by using old image |
| **📋 Catalog System** | Docker MCP manages server discovery and lifecycle |

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Desktop │────▶│  Docker MCP     │────▶│  Your Custom    │
│                 │     │  Gateway        │     │  MCP Server     │
└─────────────────┘     └─────────────────┘     │  (Container)    │
                                                 └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed

2. **Docker MCP Beta feature enabled:**
      
   Open Docker Desktop → Settings → Beta Features → Enable "MCP Toolkit"

3. **Claude Desktop connected via Docker MCP:**
      
   In Docker Desktop → Settings → MCP → Clients → Connect Claude Desktop

### ⚡ 30-Second Start (Try the Example)

```bash
# Clone and build the dice-roller example
git clone https://github.com/alon-ben-yaakov/docker-mcp-server-guide.git
cd docker-mcp-server-guide/examples/dice-roller
docker build -t dice-roller-mcp .

# Register with Docker MCP
docker mcp catalog import ./catalog-entry.yaml
docker mcp server enable dice-roller
```

Restart Claude Desktop and you're done! 🎉

> **Tip:** Verify with `docker mcp catalog ls` and `docker mcp server ls`
>
> **Note:** Close Claude Desktop completely (use Task Manager to end `Claude.exe` if needed) before reopening.

> **First time?** You'll also need to [configure Claude Desktop](docs/CREATING-CUSTOM-DOCKER-MCP-SERVER.md#step-4-configure-claude-desktop) to use Docker MCP gateway.

### Create Your Own Server

```bash
# Copy the template
cp -r templates/typescript my-mcp-server
cd my-mcp-server

# Build Docker image
docker build -t my-mcp-server .

# Register with Docker MCP
docker mcp catalog import ./catalog-entry.yaml
docker mcp server enable my-server
```

See the [full guide](docs/CREATING-CUSTOM-DOCKER-MCP-SERVER.md) for detailed instructions on customizing your server.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Full Guide](docs/CREATING-CUSTOM-DOCKER-MCP-SERVER.md) | Complete step-by-step tutorial |
| [TypeScript Template](templates/typescript/) | Starter template for new servers |
| [Catalog Templates](templates/catalog/) | Docker MCP catalog configuration |
| [Dice Roller Example](examples/dice-roller/) | Tabletop RPG dice mechanics |
| [Dev Utils Example](examples/dev-utils/) | Developer utilities (UUID, hashing, encoding) |

---

## 📁 Repository Structure

```
docker-mcp-server-guide/
├── docs/                    # Full documentation
├── templates/
│   ├── typescript/          # Starter template
│   └── catalog/             # Catalog config templates
├── examples/
│   ├── dice-roller/         # Tabletop RPG dice tools
│   └── dev-utils/           # Developer utilities
└── assets/                  # Screenshots
```

---

## 🎲 Example: Dice Roller

The [dice-roller](examples/dice-roller/) example includes 9 tools:

| Tool | Description |
|------|-------------|
| `roll_dice` | Standard dice notation (2d6, 1d20+5) |
| `coin_flip` | Flip one or more coins |
| `roll_advantage` | D&D advantage (2d20, take highest) |
| `roll_disadvantage` | D&D disadvantage (2d20, take lowest) |
| `roll_exploding` | Exploding dice mechanics |
| `roll_pool` | Dice pool with success counting |
| `roll_fate` | Fate/Fudge dice (4dF) |
| `roll_percentile` | d100 with optional target |
| `pick_random` | Random item picker |

---

## 🛠️ Example: Dev Utils

The [dev-utils](examples/dev-utils/) example includes 17 developer tools:

| Category | Tools |
|----------|-------|
| **UUID & Hashing** | `generate_uuid`, `hash` (MD5/SHA256/etc.) |
| **Encoding** | `base64_encode`, `base64_decode`, `url_encode`, `url_decode` |
| **Timestamps** | `timestamp_now`, `timestamp_convert` |
| **JSON** | `json_format`, `json_minify` |
| **Regex** | `regex_test`, `regex_replace` |
| **Strings** | `string_case`, `string_length` |
| **Colors** | `color_convert` (HEX/RGB/HSL) |
| **Numbers** | `number_convert` (decimal/binary/hex) |
| **Generators** | `lorem_ipsum` |

Perfect for developers who want these utilities without leaving Claude!

---

## 🔧 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **MCP SDK**: [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- **Validation**: Zod
- **Container**: Docker

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Ideas for contributions:
- 🐍 Python template
- 🦀 Rust template  
- 📸 Screenshots and demo GIFs
- 🌍 Additional examples

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

This guide was inspired by [NetworkChuck's MCP Server tutorial](https://www.youtube.com/watch?v=GuTcle5edjk&pp=ygUDbWNw). His video helped me understand Docker MCP integration. I created this guide to document my learnings, provide a TypeScript-focused approach using Docker's MCP CLI commands and share the troubleshooting solutions I discovered along the way.

---

## 🔗 Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Claude Desktop](https://claude.ai/download)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
