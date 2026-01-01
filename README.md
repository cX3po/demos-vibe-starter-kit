# 🚀 Demos Vibe Starter Kit

**The ultimate beginner-friendly starter kit for vibe coding on the Demos Network (Omniweb)**

One command to install. Countless chains to explore. Pure vibes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

---

## 🌟 What is This?

Demos Vibe Starter Kit is a complete, batteries-included package that gets you coding on the Demos Network in minutes, not hours. Perfect for:

- 🎓 **Complete beginners** wanting to explore blockchain development
- 🔗 **Multi-chain enthusiasts** who want to interact with multiple blockchains
- 🏆 **Demos community members** building cool projects
- 🧪 **Developers** wanting to prototype cross-chain applications

## ✨ Features

- ⚡ **One-Command Setup** - Install and configure everything with interactive wizards
- 🌐 **Multi-Chain Ready** - XRP, Ethereum, Solana, Bitcoin, and more
- 📚 **6 Ready-to-Run Examples** - From "Hello World" to multi-chain demos
- 🎯 **Interactive Launcher** - Beautiful menu-driven interface
- ✅ **Health Checks** - Automatic configuration validation
- 📖 **Comprehensive Docs** - Clear guides for every step
- 🎨 **Beautiful CLI** - Colorful, informative output
- 🛡️ **Secure by Default** - Best practices baked in

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher ([Download](https://nodejs.org/))
- Git (for cloning)
- Basic command line knowledge

### Installation

```bash
# Clone the repository
git clone https://github.com/demos-community/demos-vibe-starter-kit.git
cd demos-vibe-starter-kit

# Install dependencies
npm install

# Run the interactive setup wizard
npm run setup

# Start vibe coding!
npm start
```

That's it! The setup wizard will guide you through everything.

## 📚 What's Included

### Examples

1. **Hello Demos** (`npm run hello`) - Connect to the Demos Network
2. **XRP Transaction** (`npm run xrp`) - Send XRP via Demos Network
3. **Ethereum Transaction** (`npm run eth`) - Send ETH via Demos Network
4. **Solana Transaction** (`npm run sol`) - Send SOL via Demos Network
5. **Bitcoin Transaction** (`npm run btc`) - Send BTC via Demos Network
6. **Multi-Chain Demo** (`npm run multi`) - Run all examples in sequence

### Utilities

- `npm start` - Interactive launcher menu
- `npm run setup` - Configuration wizard
- `npm run validate` - Validate your configuration
- `npm run health` - Run health checks

## 🎯 Usage

### Interactive Mode (Recommended for Beginners)

```bash
npm start
```

This launches an interactive menu where you can:
- Choose which example to run
- Run the setup wizard
- Validate your configuration
- View documentation

### Direct Command Mode

```bash
# Run specific examples directly
npm run hello    # Connect to Demos Network
npm run xrp      # Send XRP transaction
npm run eth      # Send ETH transaction
npm run sol      # Send SOL transaction
npm run btc      # Send BTC transaction
npm run multi    # Run multi-chain demo
```

## 🔧 Configuration

Your configuration is stored in `.env` file. The setup wizard creates this for you, but you can also edit it manually:

```env
# Demos Network (Required)
DEMOS_RPC_URL=https://rpc.demos.network

# XRP Ledger (Optional)
XRPL_NETWORK=wss://s.altnet.rippletest.net:51233
XRPL_PRIVATE_KEY=your_private_key_here

# Ethereum (Optional)
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETH_PRIVATE_KEY=your_private_key_here

# ... and more
```

### Getting Test Tokens

You'll need test tokens to run the examples:

- **XRP Testnet**: https://xrpl.org/xrp-testnet-faucet.html
- **ETH Sepolia**: https://sepoliafaucet.com/
- **SOL Devnet**: https://faucet.solana.com/
- **BTC Testnet**: https://bitcoinfaucet.uo1.net/

## 📖 Documentation

- [Getting Started Guide](docs/getting-started.md) - Detailed walkthrough
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [Demos SDK API Docs](https://docs.demos.sh/sdk) - Official SDK documentation

## 🏗️ Project Structure

```
demos-vibe-starter-kit/
├── examples/           # Example scripts
│   ├── 01-hello-demos.js
│   ├── 02-xrp-transaction.js
│   ├── 03-ethereum-transaction.js
│   ├── 04-solana-transaction.js
│   ├── 05-bitcoin-transaction.js
│   └── 06-multi-chain-demo.js
├── utils/              # Helper utilities
│   ├── demo-helpers.js
│   ├── config-validator.js
│   └── health-check.js
├── docs/               # Documentation
├── mcp/                # MCP server configuration
├── launcher.js         # Interactive launcher
├── setup-wizard.js     # Setup wizard
├── package.json        # Dependencies
├── .env.example        # Configuration template
└── README.md           # This file
```

## 🤝 Contributing

This is a community project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

## 🏆 Community Challenge

This starter kit was created as part of the Demos Network Community Challenge!

If you're submitting this for the challenge:
1. ✅ Make sure all examples work
2. ✅ Add your own creative examples
3. ✅ Update the documentation
4. ✅ Test with multiple chains
5. ✅ Share your submission!

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [@kynesyslabs/demosdk](https://www.npmjs.com/package/@kynesyslabs/demosdk)
- Powered by [Demos Network (Omniweb)](https://demos.network)
- Created for the Demos Community Challenge

## 📞 Support

- 📚 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/demos-community/demos-vibe-starter-kit/issues)
- 💬 [Demos Community Discord](https://discord.gg/demos)
- 🌐 [Demos Network Website](https://demos.network)

---

**Happy Vibe Coding! 🎉**

Made with ❤️ by the Demos Community
