require('dotenv').config();
const {
    displayHeader,
    displaySuccess,
    displayError,
    displayInfo,
    displayWarning,
    displaySeparator,
    displayCompletion
} = require('../utils/demo-helpers');

/**
 * Example 06: Multi-Chain Demo
 *
 * This example demonstrates the power of the Demos Network by
 * allowing you to interact with multiple blockchains in sequence
 * or parallel, showcasing true cross-chain capabilities.
 *
 * This is where Omniweb really shines!
 */

// Import all chain examples
const helloDemos = require('./01-hello-demos');
const sendXRPTransaction = require('./02-xrp-transaction');
const sendEthereumTransaction = require('./03-ethereum-transaction');
const sendSolanaTransaction = require('./04-solana-transaction');
const sendBitcoinTransaction = require('./05-bitcoin-transaction');

async function multiChainDemo() {
    const startTime = Date.now();

    displayHeader('EXAMPLE 06: Multi-Chain Demo - The Power of Omniweb');

    console.log('This demo showcases the Demos Network\'s ability to coordinate');
    console.log('transactions across multiple blockchains seamlessly.\n');

    displayInfo('💡 You can run examples individually with these commands:');
    console.log('   - npm run hello  (Connect to Demos Network)');
    console.log('   - npm run xrp    (Send XRP transaction)');
    console.log('   - npm run eth    (Send ETH transaction)');
    console.log('   - npm run sol    (Send SOL transaction)');
    console.log('   - npm run btc    (Send BTC transaction)\n');

    displaySeparator();

    // Check which chains are configured
    const configuredChains = [];
    const availableExamples = {
        'Demos Network': { configured: !!process.env.DEMOS_RPC_URL, runner: helloDemos },
        'XRP Ledger': {
            configured: !!(process.env.XRPL_NETWORK && process.env.XRPL_PRIVATE_KEY),
            runner: sendXRPTransaction
        },
        'Ethereum': {
            configured: !!(process.env.ETH_RPC_URL && process.env.ETH_PRIVATE_KEY),
            runner: sendEthereumTransaction
        },
        'Solana': {
            configured: !!(process.env.SOLANA_RPC_URL && process.env.SOLANA_PRIVATE_KEY),
            runner: sendSolanaTransaction
        },
        'Bitcoin': {
            configured: !!(process.env.BTC_NETWORK && process.env.BTC_PRIVATE_KEY),
            runner: sendBitcoinTransaction
        }
    };

    console.log('📊 Chain Configuration Status:\n');
    Object.entries(availableExamples).forEach(([chain, { configured }]) => {
        const status = configured ? '✅ Configured' : '❌ Not configured';
        console.log(`   ${chain.padEnd(20)} ${status}`);
        if (configured) {
            configuredChains.push(chain);
        }
    });

    displaySeparator();

    if (configuredChains.length === 0) {
        displayError('No chains configured!');
        console.log('\n💡 To get started:');
        console.log('   1. Run `npm run setup` to configure your chains');
        console.log('   2. Or manually edit your .env file');
        console.log('   3. Then run this demo again\n');
        process.exit(1);
    }

    if (configuredChains.length === 1 && configuredChains[0] === 'Demos Network') {
        displayWarning('Only Demos Network is configured.');
        console.log('\n💡 Configure additional chains to see true multi-chain magic!');
        console.log('   Run `npm run setup` to add more chains\n');
        displaySeparator();
    }

    displayInfo(`Running examples for ${configuredChains.length} configured chain(s)...\n`);

    // Run configured examples in sequence
    for (const [chain, { configured, runner }] of Object.entries(availableExamples)) {
        if (!configured) continue;

        try {
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`  Running ${chain} Example`);
            console.log('═'.repeat(60) + '\n');

            await runner();

            displaySuccess(`${chain} example completed!`);

            // Small delay between examples for better readability
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            displayError(`${chain} example failed: ${error.message}`);
            console.log(`Continuing with remaining examples...\n`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('  🎉 MULTI-CHAIN DEMO COMPLETE!');
    console.log('='.repeat(60) + '\n');

    console.log('📊 Summary:');
    console.log(`   Chains Configured: ${configuredChains.length}`);
    console.log(`   Examples Run: ${configuredChains.length}`);
    console.log(`   Platform: Demos Network (Omniweb)\n`);

    displayInfo('🌐 You just experienced the power of cross-chain coordination!');
    displayInfo('💡 This is what makes Demos Network special - seamless multi-chain interaction.\n');

    if (configuredChains.length < 5) {
        displayInfo('💪 Level up your vibe: Configure more chains with `npm run setup`');
    }

    displayCompletion(startTime);

    console.log('🏆 Ready to submit this to the Demos community challenge?');
    console.log('📦 Package location: ' + process.cwd());
    console.log('📝 Don\'t forget to check the README.md for submission instructions!\n');
}

// Run if called directly
if (require.main === module) {
    multiChainDemo().catch(error => {
        displayError('Multi-chain demo failed');
        console.error(error);
        process.exit(1);
    });
}

module.exports = multiChainDemo;
