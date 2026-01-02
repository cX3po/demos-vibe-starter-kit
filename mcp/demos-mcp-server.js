#!/usr/bin/env node

/**
 * Demos Network MCP Server
 *
 * This MCP server provides tools for interacting with the Demos Network
 * through the Model Context Protocol, allowing AI assistants to directly
 * access blockchain functionality.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { demos, DemosWebAuth } = require("@kynesyslabs/demosdk/websdk");
const { XRPL } = require("@kynesyslabs/demosdk/xm-websdk");

// Server configuration
const DEMOS_RPC_URL = process.env.DEMOS_RPC_URL || 'https://rpc.demos.network';

// Server state
let demosConnected = false;
let identity = null;

// Initialize MCP Server
const server = new Server(
  {
    name: 'demos-network',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: connect_to_demos
 * Connects to the Demos Network and creates an identity
 */
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'connect_to_demos':
        return await connectToDemos(args);

      case 'get_demos_status':
        return await getDemosStatus();

      case 'send_xrp_transaction':
        return await sendXRPTransaction(args);

      case 'get_network_info':
        return await getNetworkInfo();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * List available tools
 */
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'connect_to_demos',
        description: 'Connect to the Demos Network and create a blockchain identity',
        inputSchema: {
          type: 'object',
          properties: {
            rpcUrl: {
              type: 'string',
              description: 'Demos RPC URL (optional, uses default if not provided)',
            },
          },
        },
      },
      {
        name: 'get_demos_status',
        description: 'Get the current connection status and identity information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'send_xrp_transaction',
        description: 'Send an XRP transaction through the Demos Network',
        inputSchema: {
          type: 'object',
          properties: {
            recipient: {
              type: 'string',
              description: 'XRP recipient address',
            },
            amount: {
              type: 'string',
              description: 'Amount of XRP to send (e.g., "0.01")',
            },
            network: {
              type: 'string',
              description: 'XRPL network endpoint (optional)',
              default: 'wss://s.altnet.rippletest.net:51233',
            },
          },
          required: ['recipient', 'amount'],
        },
      },
      {
        name: 'get_network_info',
        description: 'Get information about available blockchain networks',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Tool Implementation Functions

async function connectToDemos(args) {
  try {
    const rpcUrl = args.rpcUrl || DEMOS_RPC_URL;

    // Create identity
    identity = DemosWebAuth.getInstance();
    await identity.create();

    // Connect to Demos Network
    await demos.connect(rpcUrl);
    await demos.connectWallet(identity.keypair.privateKey);

    demosConnected = true;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Successfully connected to Demos Network',
            identity: {
              publicKey: identity.keypair.publicKey,
            },
            network: {
              rpcUrl: rpcUrl,
            },
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

async function getDemosStatus() {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          connected: demosConnected,
          identity: identity ? {
            publicKey: identity.keypair.publicKey,
          } : null,
          rpcUrl: DEMOS_RPC_URL,
        }, null, 2),
      },
    ],
  };
}

async function sendXRPTransaction(args) {
  if (!demosConnected || !identity) {
    throw new Error('Not connected to Demos Network. Call connect_to_demos first.');
  }

  const { recipient, amount, network } = args;
  const xrplNetwork = network || 'wss://s.altnet.rippletest.net:51233';

  try {
    // This is a simplified version - in production you'd need private keys
    // For now, return a guide on how to send transactions
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Transaction preparation guide',
            steps: [
              'Connect to XRPL network',
              `Send ${amount} XRP to ${recipient}`,
              'Submit through Demos Network',
              'Get transaction hash',
            ],
            note: 'For security, actual transaction signing requires private keys from environment variables',
            requiredEnv: ['XRPL_PRIVATE_KEY'],
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

async function getNetworkInfo() {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          demosNetwork: {
            name: 'Demos Network (Omniweb)',
            rpcUrl: DEMOS_RPC_URL,
            description: 'Cross-chain interoperability layer',
          },
          supportedChains: [
            {
              name: 'XRP Ledger',
              testnet: 'wss://s.altnet.rippletest.net:51233',
              mainnet: 'wss://s1.ripple.com',
            },
            {
              name: 'Ethereum',
              testnet: 'Sepolia',
              description: 'Smart contract platform',
            },
            {
              name: 'Solana',
              testnet: 'devnet',
              description: 'High-performance blockchain',
            },
            {
              name: 'Bitcoin',
              testnet: 'testnet',
              description: 'Original cryptocurrency',
            },
          ],
        }, null, 2),
      },
    ],
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Demos Network MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
