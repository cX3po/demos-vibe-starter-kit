# Troubleshooting Guide

Having issues? Don't worry - this guide covers common problems and their solutions.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Connection Issues](#connection-issues)
- [Transaction Failures](#transaction-failures)
- [Chain-Specific Issues](#chain-specific-issues)
- [Other Common Issues](#other-common-issues)

## Installation Issues

### "Node.js is not installed" or "node: command not found"

**Problem:** Node.js is not installed or not in your PATH.

**Solution:**
1. Download and install Node.js from https://nodejs.org/
2. Choose the LTS (Long Term Support) version
3. Restart your terminal after installation
4. Verify: `node -v` should show v16 or higher

### "npm install" fails with permission errors

**Problem:** Insufficient permissions to install packages.

**Linux/Mac Solution:**
```bash
# Don't use sudo npm install!
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Windows Solution:**
- Run terminal as Administrator
- Or install Node.js for your user account only

### Dependencies installation is slow

**Problem:** Network speed or npm registry issues.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use a faster mirror (if in China, for example)
npm install --registry=https://registry.npmmirror.com
```

## Configuration Issues

### ".env file not found"

**Problem:** Configuration file doesn't exist.

**Solution:**
```bash
# Run the setup wizard
npm run setup

# Or copy the template manually
cp .env.example .env
# Then edit .env with your values
```

### "Missing required variable: DEMOS_RPC_URL"

**Problem:** Configuration is incomplete.

**Solution:**
```bash
# Run the setup wizard
npm run setup

# Or manually add to .env:
DEMOS_RPC_URL=https://rpc.demos.network
```

### Validation shows "placeholder text" warnings

**Problem:** You haven't replaced example values in .env

**Solution:**
Open `.env` and replace all placeholder values:
- `your_private_key_here` → Your actual private key
- `YOUR_KEY` → Your actual API key
- `YOUR_INFURA_KEY` → Your actual Infura key

## Connection Issues

### "Failed to connect to Demos Network"

**Possible causes:**

1. **Internet connection issue**
   ```bash
   # Test your internet
   ping google.com
   ```

2. **RPC URL is incorrect**
   ```bash
   # Verify your DEMOS_RPC_URL in .env
   # Default should be: https://rpc.demos.network
   ```

3. **Firewall blocking connection**
   - Check your firewall settings
   - Try disabling VPN temporarily

4. **RPC endpoint is down**
   - Check Demos Network status
   - Try alternative RPC endpoints

### "Connection timeout" errors

**Problem:** Network request taking too long.

**Solution:**
1. Check your internet speed
2. Try a different network
3. Disable VPN if you're using one
4. Increase timeout in code (advanced)

### WebSocket connection failures (XRPL)

**Problem:** Can't connect to wss:// endpoints.

**Solution:**
1. Some networks block WebSocket connections
2. Try a different network (mobile hotspot, different WiFi)
3. Check if corporate firewall is blocking
4. Use alternative XRPL endpoints:
   - `wss://s1.ripple.com` (mainnet)
   - `wss://s.altnet.rippletest.net:51233` (testnet)

## Transaction Failures

### "Insufficient funds" error

**Problem:** Wallet doesn't have enough tokens.

**Solution:**

**For Testnets:**
- XRP: https://xrpl.org/xrp-testnet-faucet.html
- ETH: https://sepoliafaucet.com/
- SOL: https://faucet.solana.com/
- BTC: https://bitcoinfaucet.uo1.net/

**For Mainnet:**
- Buy tokens from an exchange
- Transfer from another wallet

### "Gas estimation failed" (Ethereum)

**Problem:** Transaction simulation failed.

**Possible causes:**
1. Insufficient ETH for gas
2. Invalid recipient address
3. Contract error (if calling smart contract)

**Solution:**
```bash
# Make sure you have enough ETH
# Check recipient address is valid
# For testnet, get more ETH from faucet
```

### "Invalid private key" error

**Problem:** Private key format is incorrect.

**Solution:**
1. **Check format:**
   - Should start with `0x` (Ethereum, most chains)
   - Or be base58 encoded (Solana)
   - Or be WIF format (Bitcoin)

2. **Remove extra characters:**
   - No spaces
   - No line breaks
   - No quotes (unless in code)

3. **Regenerate if needed:**
   - Create a new test wallet
   - Export the private key correctly

### "Nonce too low" (Ethereum)

**Problem:** Transaction nonce is out of sync.

**Solution:**
This usually resolves itself. If not:
1. Wait a few minutes
2. Try the transaction again
3. Clear any pending transactions

## Chain-Specific Issues

### XRP Issues

**"tecNO_DST_INSUF_XRP"**
- Recipient account doesn't exist or doesn't meet minimum reserve
- Send at least 10 XRP to create new accounts on testnet

**"tecUNFUNDED_PAYMENT"**
- Source account has insufficient XRP
- Need at least the amount + transaction fee

**"tefPAST_SEQ"**
- Sequence number is old
- Usually retrying fixes this

### Ethereum Issues

**"Replacement transaction underpriced"**
- You're trying to replace a pending transaction
- Wait for the first transaction to complete
- Or increase gas price significantly

**"Execution reverted"**
- Smart contract rejected the transaction
- Check contract requirements
- For simple transfers, check recipient address

### Solana Issues

**"Blockhash not found"**
- Transaction blockhash expired (common)
- This is normal - just retry
- Solana blockhashes expire after ~60 seconds

**"Account not found"**
- Recipient account doesn't exist
- Need to create account first (rent exempt minimum)

### Bitcoin Issues

**"Insufficient priority"**
- Transaction fee too low
- Increase the fee for faster confirmation
- Or wait longer for confirmation

**"Missing inputs"**
- UTXO issue
- This is usually handled by the SDK
- If persists, check wallet has unspent outputs

## Other Common Issues

### Examples run but nothing happens

**Problem:** No output or silent failure.

**Solution:**
1. Check if .env file has all required variables
2. Run `npm run validate` to check configuration
3. Enable debug mode:
   ```env
   DEBUG=true
   ```
4. Check console for error messages

### "Cannot find module" errors

**Problem:** Dependencies not installed correctly.

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# If still failing, check Node.js version
node -v  # Should be v16+
```

### Windows-specific path issues

**Problem:** Paths with spaces or backslashes causing issues.

**Solution:**
- Avoid spaces in directory names
- Use forward slashes in .env: `C:/Users/...` not `C:\Users\...`
- Or use double backslashes: `C:\\Users\\...`

### "EADDRINUSE" error

**Problem:** Port already in use (shouldn't happen with this kit).

**Solution:**
- Restart your terminal
- Check if another instance is running
- Kill the process using the port

### Rate limiting errors

**Problem:** Too many requests to RPC endpoints.

**Solution:**
- Wait a few minutes between requests
- For heavy usage, get a paid RPC service:
  - Infura (Ethereum)
  - Alchemy (Ethereum)
  - QuickNode (multi-chain)

### JSON parsing errors

**Problem:** Invalid JSON in configuration or response.

**Solution:**
1. **Check .env file:**
   - No quotes around values
   - No commas at end of lines
   - No JSON syntax (it's not JSON!)

2. **Check for network issues:**
   - Incomplete response from server
   - Try again

## Still Having Issues?

### Quick Diagnostics

Run these commands to gather information:

```bash
# Check Node.js version
node -v

# Check npm version
npm -v

# Validate configuration
npm run validate

# Run health check
npm run health

# Check if .env exists
ls -la .env  # Mac/Linux
dir .env     # Windows
```

### Getting Help

1. **Check existing issues:**
   - GitHub Issues: https://github.com/demos-community/demos-vibe-starter-kit/issues
   - Search for your error message

2. **Create a new issue:**
   - Include error message
   - Include output of diagnostic commands
   - Describe what you were trying to do
   - DO NOT include private keys!

3. **Ask the community:**
   - Demos Discord: https://discord.gg/demos
   - Community forums
   - Stack Overflow (tag: demos-network)

4. **Check official docs:**
   - Demos SDK Docs: https://docs.demos.sh/sdk
   - API Reference: https://docs.demos.sh/api

## Best Practices to Avoid Issues

1. **Always use testnet first**
   - Don't risk real funds while learning
   - Testnet tokens are free!

2. **Keep backups**
   - Save your .env file securely
   - Back up private keys (encrypted!)
   - Never commit .env to git

3. **Start simple**
   - Run examples in order
   - Don't skip "Hello Demos"
   - Understand one chain before adding more

4. **Read error messages**
   - They usually tell you what's wrong
   - Google the error message
   - Check the troubleshooting guide (this file!)

5. **Keep dependencies updated**
   ```bash
   npm update
   ```

6. **Use version control**
   ```bash
   git init
   git add .
   git commit -m "Initial setup"
   ```

---

**Remember:** Every developer faces these issues. Don't get discouraged!

The community is here to help. When in doubt, ask!

**Happy debugging! 🐛→🎉**
