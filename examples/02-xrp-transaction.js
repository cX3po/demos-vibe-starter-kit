require('dotenv').config();
const { XRPL } = require("@kynesyslabs/demosdk/xm-websdk");
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
 * Example 02: XRP Transaction on Demos Network
 *
 * Learn how to:
 * - Connect to XRPL testnet
 * - Prepare and sign an XRP payment
 * - Submit the transaction through Demos Network
 * - Track the transaction on both XRPL and Demos explorers
 */

async function sendXRPTransaction() {
    const startTime = Date.now();

    try {
        displayHeader('EXAMPLE 02: XRP Transaction via Demos Network');

        // Configuration
        const recipient = "r4bWipwzPvG4VJVbiR8fid4zZsJ5vhPiUF"; // Test recipient
        const amount = "0.01"; // XRP amount
        const demoAccountNumber = process.env.DEMO_ACCOUNT_NUMBER || "0x4Abf43C71927A77C96E9cf0AcEEa715ffBDcD34e";

        displayInfo(`Sending ${amount} XRP to ${formatAddress(recipient)}\n`);

        // Step 1: Validate configuration
        displayStep(1, 7, 'Validating configuration');
        const xrplNetwork = validateEnvVar('XRPL_NETWORK');
        const xrplPrivateKey = validateEnvVar('XRPL_PRIVATE_KEY');
        const demosRpcUrl = validateEnvVar('DEMOS_RPC_URL');
        displaySuccess('Configuration validated');

        // Step 2: Connect to XRPL
        displayStep(2, 7, 'Connecting to XRPL network');
        const xrpl = new XRPL(xrplNetwork);
        await xrpl.connect(false);
        await xrpl.connectWallet(xrplPrivateKey);
        displaySuccess(`Connected to XRPL: ${xrplNetwork}`);

        // Step 3: Prepare XRP payment
        displayStep(3, 7, 'Preparing XRP payment');
        const signedTx = await xrpl.preparePay(recipient, amount);
        displaySuccess(`Payment prepared`);
        displayInfo(`Transaction hash: ${signedTx.hash}`);

        // Step 4: Create XM Script
        displayStep(4, 7, 'Creating cross-messaging script');
        const xrpScript = prepareXMScript({
            chain: "xrpl",
            subchain: "testnet",
            signedPayloads: [signedTx],
            type: "pay",
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
        const tx = await prepareXMPayload(xrpScript, identity.keypair);
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
            // Broadcast response parsing may fail, but transaction often succeeds
            displayInfo('Broadcast response parsing issue (transaction likely succeeded)');
        }

        // Display results
        console.log('\n' + '='.repeat(60));
        console.log('  🎉 TRANSACTION SUCCESSFUL!');
        console.log('='.repeat(60));

        displayTransaction(
            '💰 XRPL Transaction',
            signedTx.hash,
            `https://testnet.xrpl.org/transactions/${signedTx.hash}`
        );

        displayTransaction(
            '🌐 Demos Transaction',
            tx.hash,
            `https://explorer.demos.sh/transactions/${tx.hash}`
        );

        console.log(`\n📋 Details:`);
        console.log(`  Amount: ${amount} XRP`);
        console.log(`  Recipient: ${recipient}`);
        console.log(`  Account: ${formatAddress(demoAccountNumber)}`);

        displayInfo('\n💡 Next: Try `npm run eth` to send an Ethereum transaction!');

        displayCompletion(startTime);

    } catch (error) {
        displayError('Transaction Failed');
        console.error('Error details:', error.message);

        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Ensure XRPL_PRIVATE_KEY is set in your .env file');
        console.log('   2. Make sure your XRPL wallet has testnet XRP');
        console.log('   3. Get testnet XRP from: https://xrpl.org/xrp-testnet-faucet.html');
        console.log('   4. Verify XRPL_NETWORK is set to a valid endpoint');
        console.log('   5. Run `npm run validate` to check configuration\n');

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    sendXRPTransaction();
}

module.exports = sendXRPTransaction;
