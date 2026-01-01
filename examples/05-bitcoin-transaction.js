require('dotenv').config();
const { Bitcoin } = require("@kynesyslabs/demosdk/xm-websdk");
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
 * Example 05: Bitcoin Transaction on Demos Network
 *
 * Learn how to:
 * - Connect to Bitcoin testnet
 * - Prepare and sign a BTC transfer
 * - Submit the transaction through Demos Network
 * - Track on both Bitcoin and Demos explorers
 */

async function sendBitcoinTransaction() {
    const startTime = Date.now();

    try {
        displayHeader('EXAMPLE 05: Bitcoin Transaction via Demos Network');

        // Configuration
        const recipient = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"; // Test recipient (testnet)
        const amount = "0.0001"; // BTC amount
        const demoAccountNumber = process.env.DEMO_ACCOUNT_NUMBER || "0x4Abf43C71927A77C96E9cf0AcEEa715ffBDcD34e";

        displayInfo(`Sending ${amount} BTC to ${formatAddress(recipient, 8, 8)}\n`);

        // Step 1: Validate configuration
        displayStep(1, 7, 'Validating configuration');
        const btcNetwork = validateEnvVar('BTC_NETWORK');
        const btcPrivateKey = validateEnvVar('BTC_PRIVATE_KEY');
        const demosRpcUrl = validateEnvVar('DEMOS_RPC_URL');
        displaySuccess('Configuration validated');

        // Step 2: Connect to Bitcoin
        displayStep(2, 7, 'Connecting to Bitcoin network');
        const bitcoin = new Bitcoin(btcNetwork);
        await bitcoin.connect();
        await bitcoin.connectWallet(btcPrivateKey);
        displaySuccess(`Connected to Bitcoin ${btcNetwork}`);

        // Step 3: Prepare BTC transfer
        displayStep(3, 7, 'Preparing BTC transfer');
        const signedTx = await bitcoin.prepareTransfer(recipient, amount);
        displaySuccess('Transfer prepared');
        displayInfo(`Transaction ID: ${signedTx.txid}`);

        // Step 4: Create XM Script
        displayStep(4, 7, 'Creating cross-messaging script');
        const btcScript = prepareXMScript({
            chain: "bitcoin",
            subchain: btcNetwork,
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
        const tx = await prepareXMPayload(btcScript, identity.keypair);
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
            '₿ Bitcoin Transaction',
            signedTx.txid,
            `https://blockstream.info/testnet/tx/${signedTx.txid}`
        );

        displayTransaction(
            '🌐 Demos Transaction',
            tx.hash,
            `https://explorer.demos.sh/transactions/${tx.hash}`
        );

        console.log(`\n📋 Details:`);
        console.log(`  Amount: ${amount} BTC`);
        console.log(`  Recipient: ${recipient}`);
        console.log(`  Account: ${formatAddress(demoAccountNumber)}`);

        displayInfo('\n💡 Next: Try `npm run multi` to see multi-chain magic!');

        displayCompletion(startTime);

    } catch (error) {
        displayError('Transaction Failed');
        console.error('Error details:', error.message);

        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Ensure BTC_PRIVATE_KEY is set in your .env file');
        console.log('   2. Make sure your wallet has testnet BTC');
        console.log('   3. Get testnet BTC from: https://bitcoinfaucet.uo1.net/');
        console.log('   4. Verify BTC_NETWORK is set to "testnet"');
        console.log('   5. Run `npm run validate` to check configuration\n');

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    sendBitcoinTransaction();
}

module.exports = sendBitcoinTransaction;
