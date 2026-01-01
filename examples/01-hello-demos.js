require('dotenv').config();
const { demos, DemosWebAuth } = require("@kynesyslabs/demosdk/websdk");
const {
    displayHeader,
    displaySuccess,
    displayError,
    displayInfo,
    displayStep,
    displayCompletion,
    validateEnvVar
} = require('../utils/demo-helpers');

/**
 * Example 01: Hello Demos Network
 *
 * This is your first step into the Demos Network (Omniweb)!
 * Learn how to:
 * - Connect to the Demos Network
 * - Create a Demos identity
 * - Get basic network information
 */

async function helloDemos() {
    const startTime = Date.now();

    try {
        displayHeader('EXAMPLE 01: Hello Demos Network');

        displayInfo('Welcome to the Demos Network!');
        displayInfo('This example shows you the basics of connecting to Omniweb.\n');

        // Step 1: Validate configuration
        displayStep(1, 4, 'Validating configuration');
        const rpcUrl = validateEnvVar('DEMOS_RPC_URL');
        displaySuccess(`RPC URL configured: ${rpcUrl}`);

        // Step 2: Create a Demos identity
        displayStep(2, 4, 'Creating Demos identity');
        const identity = DemosWebAuth.getInstance();
        await identity.create();
        displaySuccess('Identity created!');
        displayInfo(`Public Key: ${identity.keypair.publicKey}`);

        // Step 3: Connect to Demos Network
        displayStep(3, 4, 'Connecting to Demos Network');
        await demos.connect(rpcUrl);
        displaySuccess('Connected to Demos Network!');

        // Step 4: Connect wallet
        displayStep(4, 4, 'Connecting wallet');
        await demos.connectWallet(identity.keypair.privateKey);
        displaySuccess('Wallet connected!');

        // Display summary
        console.log('\n📊 Connection Summary:');
        console.log('─'.repeat(50));
        console.log(`Network: Demos Network (Omniweb)`);
        console.log(`RPC: ${rpcUrl}`);
        console.log(`Identity: ${identity.keypair.publicKey.substring(0, 16)}...`);
        console.log('─'.repeat(50));

        displaySuccess('You\'re now connected to the Demos Network!');
        displayInfo('🎉 Congratulations! You just completed your first Demos connection!');
        displayInfo('💡 Next: Try running `npm run xrp` to send your first transaction');

        displayCompletion(startTime);

    } catch (error) {
        displayError('Failed to connect to Demos Network');
        console.error('Error details:', error.message);

        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Make sure you have a .env file (run `npm run setup`)');
        console.log('   2. Check that DEMOS_RPC_URL is set correctly');
        console.log('   3. Verify your internet connection');
        console.log('   4. Run `npm run validate` to check your configuration\n');

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    helloDemos();
}

module.exports = helloDemos;
