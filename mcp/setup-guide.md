# MCP Server Setup Guide

This guide explains how to set up Model Context Protocol (MCP) servers for use with Claude Code and other AI assistants.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants like Claude to interact with external tools and services. With MCP, you can:

- Give Claude access to Demos Network functionality
- Create custom tools for blockchain interactions
- Build interactive workflows
- Extend Claude's capabilities with specialized functions

## Prerequisites

- Claude Code CLI installed
- Demos Vibe Starter Kit installed
- Node.js v16 or higher

## Installation

### Step 1: Check if Claude Code is Installed

```bash
# Check Claude Code installation
claude --version

# If not installed, visit:
# https://code.claude.com/
```

### Step 2: Locate Claude Code Configuration

Claude Code looks for MCP servers in:

**Linux/Mac:**
```bash
~/.claude/
```

**Windows:**
```cmd
C:\Users\YourUsername\.claude\
```

### Step 3: Understanding MCP Configuration

MCP servers are configured in `.claude.json` or `.mcp.json` files.

Example structure:
```json
{
  "mcpServers": {
    "demos-network": {
      "command": "node",
      "args": ["/path/to/demos-mcp-server.js"],
      "env": {
        "DEMOS_RPC_URL": "https://rpc.demos.network"
      }
    }
  }
}
```

## Demos MCP Server Setup

Currently, the official Demos MCP server is in development. However, you can:

### Option 1: Use the Demos SDK Directly

You don't need an MCP server to use this starter kit! All examples work standalone:

```bash
npm run hello  # Works without MCP
npm run xrp    # Works without MCP
npm start      # Interactive launcher (no MCP needed)
```

### Option 2: Create a Simple MCP Server

Create your own MCP server for Demos Network integration:

1. **Create `demos-mcp-server.js`:**

```javascript
const { demos, DemosWebAuth } = require("@kynesyslabs/demosdk/websdk");

// Simple MCP server that exposes Demos functionality
const tools = {
  connect_demos: async (rpcUrl) => {
    const identity = DemosWebAuth.getInstance();
    await identity.create();
    await demos.connect(rpcUrl);
    await demos.connectWallet(identity.keypair.privateKey);
    return { status: 'connected', publicKey: identity.keypair.publicKey };
  },

  // Add more tools here...
};

// MCP server implementation
// (Full implementation would follow MCP protocol spec)
```

2. **Add to Claude Code configuration:**

Edit `~/.claude/mcp.json`:
```json
{
  "mcpServers": {
    "demos-vibe": {
      "command": "node",
      "args": ["/full/path/to/demos-vibe-starter-kit/mcp/demos-mcp-server.js"],
      "env": {
        "DEMOS_RPC_URL": "https://rpc.demos.network"
      }
    }
  }
}
```

### Option 3: Wait for Official MCP Server

The Demos Network team may release an official MCP server. Check:
- GitHub: https://github.com/kynesyslabs/demostoolkit
- Docs: https://docs.demos.sh/
- Discord: https://discord.gg/demos

## Using MCP with Claude Code

Once configured, you can:

```bash
# Start Claude Code
claude

# @ mention MCP servers
claude> @demos-vibe help

# Use MCP tools
claude> @demos-vibe connect to demos network
```

## Sample MCP Configuration

We've included a sample configuration in this kit:

**File:** `mcp/demos-mcp-config.json`

```json
{
  "mcpServers": {
    "demos-vibe-starter-kit": {
      "command": "node",
      "args": ["launcher.js"],
      "env": {
        "DEMOS_RPC_URL": "${DEMOS_RPC_URL}",
        "NODE_ENV": "production"
      },
      "description": "Demos Vibe Starter Kit - Multi-chain blockchain examples"
    }
  }
}
```

To use this configuration:

```bash
# Copy to Claude Code config directory
cp mcp/demos-mcp-config.json ~/.claude/mcp.json

# Or merge with existing configuration
# (Edit ~/.claude/mcp.json manually)
```

## Verifying MCP Setup

### Check MCP Server Status

```bash
# In Claude Code
claude mcp list

# You should see your configured servers
```

### Test MCP Server

```bash
# Start Claude Code
claude

# Test the MCP server
claude> @demos-vibe hello
```

## Troubleshooting MCP Setup

### MCP Server Not Found

**Problem:** Claude Code doesn't see your MCP server.

**Solution:**
1. Check the path in configuration is absolute
2. Verify the command and args are correct
3. Restart Claude Code: `exit` then `claude`

### MCP Server Fails to Start

**Problem:** Server crashes on startup.

**Solution:**
1. Test the command manually:
   ```bash
   node /path/to/your/mcp-server.js
   ```
2. Check for errors in the output
3. Verify dependencies are installed
4. Check environment variables are set

### Permission Issues

**Problem:** Claude Code can't execute your MCP server.

**Solution:**
```bash
# Make the script executable (Linux/Mac)
chmod +x /path/to/your/mcp-server.js

# Or ensure node is in your PATH
which node
```

## Advanced MCP Features

### Environment Variables

Pass environment variables to your MCP server:

```json
{
  "mcpServers": {
    "demos": {
      "env": {
        "DEMOS_RPC_URL": "${DEMOS_RPC_URL}",
        "DEBUG": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Variables from your shell environment can be referenced with `${VAR_NAME}`.

### Multiple MCP Servers

You can configure multiple MCP servers:

```json
{
  "mcpServers": {
    "demos-network": { /* config */ },
    "ethereum-tools": { /* config */ },
    "solana-tools": { /* config */ }
  }
}
```

### MCP Server Lifecycle

MCP servers:
- Start when Claude Code starts
- Run in the background
- Stop when Claude Code exits
- Can be restarted with `/mcp restart`

## Next Steps

1. **Learn MCP Protocol:**
   - Official docs: https://code.claude.com/docs/mcp
   - MCP spec: https://github.com/anthropics/mcp

2. **Build Custom Tools:**
   - Create tools specific to your needs
   - Wrap Demos SDK functionality
   - Add logging and error handling

3. **Share with Community:**
   - Publish your MCP server
   - Contribute to Demos toolkit
   - Help other developers

## Resources

- **Claude Code MCP Docs:** https://code.claude.com/docs/mcp
- **Demos SDK Docs:** https://docs.demos.sh/sdk
- **Demos Toolkit:** https://github.com/kynesyslabs/demostoolkit
- **Community Discord:** https://discord.gg/demos

## Note on Development Status

As of this writing, the official Demos MCP server may still be in development. This starter kit works perfectly without MCP - all functionality is available through the interactive launcher and CLI commands.

The MCP integration is an optional enhancement for Claude Code users.

---

**Questions?** Ask in the Demos Discord or open an issue on GitHub!
