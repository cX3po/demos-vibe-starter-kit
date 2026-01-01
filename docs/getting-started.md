# Getting Started with Demos Vibe Starter Kit

Welcome to your journey into multi-chain blockchain development with the Demos Network!

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Your First Example](#running-your-first-example)
- [Understanding the Examples](#understanding-the-examples)
- [Next Steps](#next-steps)

## Prerequisites

Before you begin, make sure you have:

### Required

- **Node.js v16 or higher** - [Download here](https://nodejs.org/)
- **Basic command line knowledge** - How to navigate directories and run commands
- **Internet connection** - For downloading dependencies and connecting to networks

### Optional (but helpful)

- **Git** - For cloning the repository
- **Code editor** - VS Code, Sublime Text, or your favorite editor
- **Test wallet with funds** - For running transaction examples

## Installation

### Step 1: Get the Code

**Option A: Clone from GitHub** (recommended)
```bash
git clone https://github.com/demos-community/demos-vibe-starter-kit.git
cd demos-vibe-starter-kit
```

**Option B: Download ZIP**
1. Download the ZIP from GitHub
2. Extract it to your desired location
3. Open terminal/command prompt in that folder

### Step 2: Install Dependencies

**On Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

**On Windows:**
```cmd
install.bat
```

**Or manually:**
```bash
npm install
```

### Step 3: Verify Installation

Run the health check to make sure everything is working:

```bash
npm run health
```

If you see errors, don't worry! The setup wizard will help you fix them.

## Configuration

The setup wizard makes configuration easy. Just run:

```bash
npm run setup
```

The wizard will ask you:

### 1. Demos Network Configuration (Required)

```
Demos RPC URL [https://rpc.demos.network]:
```

Press Enter to use the default, or enter your custom RPC URL.

### 2. Which Chains to Configure

You'll be asked if you want to configure each chain:
- XRP Ledger
- Ethereum
- Solana
- Bitcoin

You can configure all of them or just the ones you're interested in.

### 3. Chain-Specific Settings

For each chain you choose to configure, you'll need:

**XRP Ledger:**
- Network endpoint (default: testnet)
- Private key

**Ethereum:**
- RPC URL (Infura, Alchemy, or other provider)
- Private key

**Solana:**
- RPC URL (default: devnet)
- Private key

**Bitcoin:**
- Network (testnet or mainnet)
- Private key

### Getting Test Tokens

To run the transaction examples, you'll need test tokens:

#### XRP Testnet Faucet
1. Visit https://xrpl.org/xrp-testnet-faucet.html
2. Generate a new testnet account
3. Copy the private key to your `.env` file

#### Ethereum Sepolia Faucet
1. Create an Ethereum wallet (MetaMask recommended)
2. Get your private key
3. Visit https://sepoliafaucet.com/ for test ETH

#### Solana Devnet Faucet
1. Install Solana CLI or use a web wallet
2. Get your private key
3. Visit https://faucet.solana.com/ for test SOL

#### Bitcoin Testnet Faucet
1. Create a Bitcoin testnet wallet
2. Get your private key
3. Visit https://bitcoinfaucet.uo1.net/ for test BTC

### Manual Configuration

If you prefer to manually edit the configuration:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your favorite editor

3. Fill in your values:
   ```env
   DEMOS_RPC_URL=https://rpc.demos.network
   XRPL_PRIVATE_KEY=your_xrp_private_key_here
   # ... etc
   ```

### Validation

After configuration, validate your setup:

```bash
npm run validate
```

This checks:
- ✅ .env file exists
- ✅ Required variables are set
- ✅ Optional chains are properly configured
- ✅ Private keys are valid format

## Running Your First Example

### Using the Interactive Launcher (Recommended)

```bash
npm start
```

This opens a beautiful menu where you can:
- Choose which example to run
- View documentation
- Run health checks
- Access the setup wizard

### Running Examples Directly

```bash
# Connect to Demos Network
npm run hello

# Send an XRP transaction
npm run xrp

# Send an Ethereum transaction
npm run eth

# Send a Solana transaction
npm run sol

# Send a Bitcoin transaction
npm run btc

# Run all configured examples
npm run multi
```

### Your First Run: Hello Demos

Let's start with the simplest example:

```bash
npm run hello
```

You should see:

```
============================================================
  EXAMPLE 01: Hello Demos Network
============================================================

ℹ️  Welcome to the Demos Network!
ℹ️  This example shows you the basics of connecting to Omniweb.

[1/4] Validating configuration...
✅ RPC URL configured: https://rpc.demos.network

[2/4] Creating Demos identity...
✅ Identity created!
ℹ️  Public Key: 0x1234...

[3/4] Connecting to Demos Network...
✅ Connected to Demos Network!

[4/4] Connecting wallet...
✅ Wallet connected!

📊 Connection Summary:
──────────────────────────────────────────────────
Network: Demos Network (Omniweb)
RPC: https://rpc.demos.network
Identity: 0x1234...
──────────────────────────────────────────────────

✅ You're now connected to the Demos Network!
🎉 Congratulations! You just completed your first Demos connection!
```

If you see this, you're all set up! 🎉

## Understanding the Examples

### Example 01: Hello Demos
**What it does:** Basic connection to Demos Network
**What you'll learn:**
- Creating a Demos identity
- Connecting to the network
- Basic SDK usage

### Example 02: XRP Transaction
**What it does:** Sends XRP through Demos Network
**What you'll learn:**
- XRPL integration
- Preparing and signing transactions
- Cross-messaging (XM) protocol
- Transaction tracking on multiple explorers

### Example 03: Ethereum Transaction
**What it does:** Sends ETH through Demos Network
**What you'll learn:**
- EVM chain integration
- Gas estimation and management
- Smart contract interaction basics

### Example 04: Solana Transaction
**What it does:** Sends SOL through Demos Network
**What you'll learn:**
- Solana program interaction
- Account management
- Transaction signatures

### Example 05: Bitcoin Transaction
**What it does:** Sends BTC through Demos Network
**What you'll learn:**
- UTXO model basics
- Bitcoin transaction structure
- Network fee management

### Example 06: Multi-Chain Demo
**What it does:** Runs all configured examples in sequence
**What you'll learn:**
- Cross-chain coordination
- The power of Omniweb
- Multi-chain application architecture

## Next Steps

### 1. Explore the Code

Open the `examples/` folder and read through the code:
- Each example is well-commented
- Code follows best practices
- Easy to understand and modify

### 2. Modify the Examples

Try changing:
- Recipient addresses
- Transaction amounts
- Add console.log statements to understand flow
- Break things (safely!) and learn from errors

### 3. Build Your Own

Use the examples as templates:
1. Copy an example that's close to what you want
2. Modify it for your use case
3. Test thoroughly
4. Share with the community!

### 4. Learn More

- [Demos SDK Documentation](https://docs.demos.sh/sdk)
- [Demos Network Whitepaper](https://demos.network/whitepaper)
- [Join the Community Discord](https://discord.gg/demos)

### 5. Contribute

Found a bug? Have an improvement? Want to add a new chain?
- Open an issue on GitHub
- Submit a pull request
- Share your custom examples

## Common Commands Reference

```bash
npm start           # Launch interactive menu
npm run setup       # Run setup wizard
npm run validate    # Validate configuration
npm run health      # Run health checks
npm run hello       # Run Hello Demos example
npm run xrp         # Run XRP example
npm run eth         # Run Ethereum example
npm run sol         # Run Solana example
npm run btc         # Run Bitcoin example
npm run multi       # Run multi-chain demo
```

## Need Help?

- 📖 Check [troubleshooting.md](troubleshooting.md)
- 🐛 [Open an issue](https://github.com/demos-community/demos-vibe-starter-kit/issues)
- 💬 [Join Discord](https://discord.gg/demos)
- 🌐 [Visit Demos Network](https://demos.network)

---

**Happy vibe coding! 🚀**

Remember: The best way to learn is by doing. Don't be afraid to experiment, break things (in testnet!), and ask questions.
