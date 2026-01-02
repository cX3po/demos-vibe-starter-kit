# 🔌 Demos Network MCP Server

This directory contains the **Model Context Protocol (MCP) server** for Demos Network integration with Claude Code and other MCP clients.

## 🌟 What is This?

The Demos MCP Server allows AI assistants like Claude to directly interact with the Demos Network and connected blockchains through standardized tools.

**With this MCP server, Claude can:**
- ✅ Connect to Demos Network nodes
- ✅ Create blockchain identities
- ✅ Query network status
- ✅ Access multi-chain functionality
- ✅ Get network information

---

## 📦 Quick Setup

### 1. Install MCP SDK

The MCP SDK is already in the main `package.json`. Just run:

```bash
cd demos-vibe-starter-kit
npm install
```

### 2. Configure Claude Code

**Option A: Automatic (Recommended)**

Copy the config to Claude Code's directory:

**Mac/Linux:**
```bash
# Get the full path to your starter kit
STARTER_KIT_PATH=$(pwd)

# Update the config with your path
sed "s|PATH_TO_STARTER_KIT|$STARTER_KIT_PATH|g" mcp/claude-code-config.json > mcp/config-ready.json

# Copy to Claude Code
mkdir -p ~/.claude
cat mcp/config-ready.json >> ~/.claude/mcp.json
```

**Windows:**
```cmd
# Get your current directory path, then manually edit:
# C:\Users\YOUR_USERNAME\.claude\mcp.json

# And add the content from mcp\claude-code-config.json
# Replace PATH_TO_STARTER_KIT with your actual path
```

**Option B: Manual**

1. Open (or create): `~/.claude/mcp.json`
2. Add this configuration:

```json
{
  "mcpServers": {
    "demos-network": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/demos-vibe-starter-kit/mcp/demos-mcp-server.js"
      ],
      "env": {
        "DEMOS_RPC_URL": "https://rpc.demos.network"
      }
    }
  }
}
```

Replace `/FULL/PATH/TO/` with your actual path!

### 3. Restart Claude Code

```bash
# If Claude Code is running, restart it
exit
claude
```

### 4. Test It

In Claude Code, try:

```
Can you connect to the Demos Network using the MCP server?
```

Claude will use the `connect_to_demos` tool automatically!

---

## 🛠️ Available Tools

The MCP server exposes these tools:

### 1. `connect_to_demos`

Connects to the Demos Network and creates a blockchain identity.

**Parameters:**
- `rpcUrl` (optional): Custom RPC URL

**Example:**
```
Claude, connect to the Demos Network
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to Demos Network",
  "identity": {
    "publicKey": "0x..."
  },
  "network": {
    "rpcUrl": "https://rpc.demos.network"
  }
}
```

### 2. `get_demos_status`

Gets current connection status and identity info.

**Example:**
```
What's my Demos Network connection status?
```

### 3. `send_xrp_transaction`

Prepares an XRP transaction through Demos Network.

**Parameters:**
- `recipient`: XRP address
- `amount`: Amount to send
- `network` (optional): XRPL endpoint

**Example:**
```
Send 0.01 XRP to r4bWipwzPvG4VJVbiR8fid4zZsJ5vhPiUF through Demos
```

### 4. `get_network_info`

Returns information about supported blockchain networks.

**Example:**
```
What blockchain networks does Demos support?
```

---

## 🧪 Testing the MCP Server

### Test Standalone

You can test the MCP server directly:

```bash
cd demos-vibe-starter-kit
node mcp/demos-mcp-server.js
```

It will wait for MCP protocol messages on stdin/stdout.

### Test with Claude Code

Once configured, just ask Claude naturally:

```
"Hey Claude, can you connect to Demos Network for me?"

"What's the status of my Demos connection?"

"Show me what blockchain networks are available"
```

---

## 🔐 Environment Variables

The MCP server respects these environment variables:

```bash
# Demos Network RPC endpoint
DEMOS_RPC_URL=https://rpc.demos.network

# XRP Ledger network (for transactions)
XRPL_NETWORK=wss://s.altnet.rippletest.net:51233

# Private keys (if needed for transactions)
XRPL_PRIVATE_KEY=your_key_here
ETH_PRIVATE_KEY=your_key_here
# etc...
```

Set them in the MCP config or in your shell environment.

---

## 📁 Files in This Directory

```
mcp/
├── demos-mcp-server.js          # Main MCP server implementation
├── claude-code-config.json      # Claude Code configuration template
├── demos-mcp-config.json        # Alternative config format
├── setup-guide.md               # Detailed setup instructions
└── README.md                    # This file
```

---

## 🐛 Troubleshooting

### "MCP server not found"

**Problem:** Claude Code can't find the MCP server.

**Solution:**
1. Check the path in `~/.claude/mcp.json` is absolute
2. Verify the file exists: `ls -l /path/to/demos-mcp-server.js`
3. Make sure it's executable: `chmod +x mcp/demos-mcp-server.js`

### "Module not found: @modelcontextprotocol/sdk"

**Problem:** MCP SDK not installed.

**Solution:**
```bash
cd demos-vibe-starter-kit
npm install
```

### "Connection failed"

**Problem:** Can't connect to Demos Network.

**Solution:**
1. Check your internet connection
2. Verify DEMOS_RPC_URL is correct
3. Try the standalone examples first: `npm run hello`

### "Tools not showing up"

**Problem:** Claude doesn't see the MCP tools.

**Solution:**
1. Restart Claude Code completely
2. Check `claude mcp list` to see if server is running
3. Look for errors in Claude Code logs

---

## 🚀 Advanced Usage

### Custom Tools

Want to add more tools? Edit `demos-mcp-server.js`:

```javascript
// Add to tools/list handler
{
  name: 'my_custom_tool',
  description: 'Does something cool',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    }
  }
}

// Add to tools/call handler
case 'my_custom_tool':
  return await myCustomFunction(args);
```

### Multiple Instances

Run multiple MCP servers for different networks:

```json
{
  "mcpServers": {
    "demos-testnet": {
      "command": "node",
      "args": ["mcp/demos-mcp-server.js"],
      "env": {
        "DEMOS_RPC_URL": "https://testnet.demos.network"
      }
    },
    "demos-mainnet": {
      "command": "node",
      "args": ["mcp/demos-mcp-server.js"],
      "env": {
        "DEMOS_RPC_URL": "https://rpc.demos.network"
      }
    }
  }
}
```

---

## 📚 Learn More

- **MCP Specification:** https://modelcontextprotocol.io/
- **Claude Code MCP Docs:** https://code.claude.com/docs/mcp
- **Demos Network:** https://docs.kynesys.xyz
- **Demos SDK:** https://www.npmjs.com/package/@kynesyslabs/demosdk

---

## 🤝 Contributing

Found a bug? Want to add a tool?

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

MIT License - same as the main project

---

**Questions?** Open an issue or ask in the Demos Discord!
