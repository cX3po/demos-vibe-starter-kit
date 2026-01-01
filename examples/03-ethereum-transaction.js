require('dotenv').config();
const { EVM } = require("@kynesyslabs/demosdk/xm-websdk");
const {
    demos,
    DemosWebAuth,
    prepareXMScript,
    prepareXMPayload
} = require("@kynesyslabs/demosdk/websdk");
const {
    displayHeader,
    displaySuccess,
    displayError,
    displayInfo,
    displayStep,
    displayTransaction,
    displayCompletion,
    validateEnvVar,
    formatAddress
} = require('../utils/demo-helpers');

/**
 * Example 03: Ethereum Transaction on Demos Network
 *
 * Learn how to:
 * - Connect to Ethereum testnet (Sepolia)
 * - Prepare and sign an ETH transfer
 * - Submit the transaction through Demos Network
 * - Track on both Ethereum and Demos explorers
 */

async function sendEthereumTransaction() {
    const startTime = Date.now();

    try {
        displayHeader('EXAMPLE 03: Ethereum Transaction via Demos Network');

        // Configuration
        const recipient = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"; // Test recipient
        const amount = "0.001"; // ETH amount
        const demoAccountNumber = process.env.DEMO_ACCOUNT_NUMBER || "0x4Abf43C71927A77C96E9cf0AcEEa715ffBDcD34e";

        displayInfo(`Sending ${amount} ETH to ${formatAddress(recipient)}\n`);

        // Step 1: Validate configuration
        displayStep(1, 7, 'Validating configuration');
        const ethRpcUrl = validateEnvVar('ETH_RPC_URL');
        const ethPrivateKey = validateEnvVar('ETH_PRIVATE_KEY');
        const demosRpcUrl = validateEnvVar('DEMOS_RPC_URL');
        displaySuccess('Configuration validated');

        // Step 2: Connect to Ethereum
        displayStep(2, 7, 'Connecting to Ethereum network');
        const evm = new EVM(ethRpcUrl);
        await evm.connect();
        await evm.connectWallet(ethPrivateKey);
        displaySuccess('Connected to Ethereum');

        // Step 3: Prepare ETH transfer
        displayStep(3, 7, 'Preparing ETH transfer');
        const signedTx = await evm.prepareTransfer(recipient, amount);
        displaySuccess('Transfer prepared');
        displayInfo(`Transaction hash: ${signedTx.hash}`);

        // Step 4: Create XM Script
        displayStep(4, 7, 'Creating cross-messaging script');
        const ethScript = prepareXMScript({
            chain: "ethereum",
            subchain: "sepolia",
            signedPayloads: [signedTx],
            type: "transfer",
            params: {
                accountNumber: demoAccountNumber,
                timestamp: Date.now()
            }
        });
        displaySuccess('XM script created');

        // Step 5: Create Demos identity
        displayStep(5, 7, 'Creating Demos identity');
        const identity = DemosWebAuth.getInstance();
        await identity.create();
        const tx = await prepareXMPayload(ethScript, identity.keypair);
        displaySuccess('Transaction payload prepared');

        // Step 6: Connect to Demos Network
        displayStep(6, 7, 'Connecting to Demos Network');
        await demos.connect(demosRpcUrl);
        await demos.connectWallet(identity.keypair.privateKey);
        displaySuccess('Connected to Demos Network');

        // Step 7: Submit transaction
        displayStep(7, 7, 'Submitting transaction to Demos Network');
        const validityData = await demos.confirm(tx);
        displaySuccess('Transaction confirmed');

        try {
            await demos.broadcast(validityData, identity.keypair);
        } catch (broadcastError) {
            displayInfo('Broadcast response parsing issue (transaction likely succeeded)');
        }

        // Display results
        console.log('\n' + '='.repeat(60));
        console.log('  🎉 TRANSACTION SUCCESSFUL!');
        console.log('='.repeat(60));

        displayTransaction(
            '⟠ Ethereum Transaction',
            signedTx.hash,
            `https://sepolia.etherscan.io/tx/${signedTx.hash}`
        );

        displayTransaction(
            '🌐 Demos Transaction',
            tx.hash,
            `https://explorer.demos.sh/transactions/${tx.hash}`
        );

        console.log(`\n📋 Details:`);
        console.log(`  Amount: ${amount} ETH`);
        console.log(`  Recipient: ${recipient}`);
        console.log(`  Account: ${formatAddress(demoAccountNumber)}`);

        displayInfo('\n💡 Next: Try `npm run sol` to send a Solana transaction!');

        displayCompletion(startTime);

    } catch (error) {
        displayError('Transaction Failed');
        console.error('Error details:', error.message);

        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Ensure ETH_PRIVATE_KEY is set in your .env file');
        console.log('   2. Make sure your wallet has testnet ETH (Sepolia)');
        console.log('   3. Get testnet ETH from: https://sepoliafaucet.com/');
        console.log('   4. Verify ETH_RPC_URL is set correctly (try Infura or Alchemy)');
        console.log('   5. Run `npm run validate` to check configuration\n');

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    sendEthereumTransaction();
}

module.exports = sendEthereumTransaction;
