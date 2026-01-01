const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Setup Wizard for Demos Vibe Starter Kit
 *
 * This interactive wizard helps beginners configure their environment
 * without needing to manually edit files.
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function displayHeader() {
    console.log('\n' + '='.repeat(60));
    console.log('  🚀 Demos Vibe Starter Kit - Setup Wizard');
    console.log('='.repeat(60) + '\n');
}

function displaySuccess(message) {
    console.log(`\n✅ ${message}\n`);
}

function displayInfo(message) {
    console.log(`ℹ️  ${message}`);
}

async function setupWizard() {
    displayHeader();

    console.log('Welcome to the Demos Vibe Starter Kit!');
    console.log('This wizard will help you set up your environment.\n');

    // Check if .env already exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        displayInfo('.env file already exists.');
        const overwrite = await question('Do you want to overwrite it? (y/N): ');
        if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
            console.log('\nSetup cancelled. Your existing .env file is unchanged.');
            console.log('Run `npm run validate` to check your configuration.\n');
            rl.close();
            return;
        }
    }

    console.log('\n📋 Let\'s configure your environment step by step...\n');
    console.log('💡 Tip: You can press Enter to use default values shown in [brackets]\n');

    // Collect configuration
    const config = {};

    // Demos Network (required)
    console.log('\n' + '-'.repeat(60));
    console.log('DEMOS NETWORK CONFIGURATION (Required)');
    console.log('-'.repeat(60));
    config.DEMOS_RPC_URL = await question('Demos RPC URL [https://rpc.demos.network]: ') || 'https://rpc.demos.network';

    // Ask which chains to configure
    console.log('\n' + '-'.repeat(60));
    console.log('BLOCKCHAIN SELECTION');
    console.log('-'.repeat(60));
    console.log('Which blockchains would you like to configure?');
    console.log('(You can always add more later by running this wizard again)\n');

    const configureXRP = (await question('Configure XRP Ledger? (Y/n): ')).toLowerCase() !== 'n';
    const configureETH = (await question('Configure Ethereum? (Y/n): ')).toLowerCase() !== 'n';
    const configureSOL = (await question('Configure Solana? (Y/n): ')).toLowerCase() !== 'n';
    const configureBTC = (await question('Configure Bitcoin? (Y/n): ')).toLowerCase() !== 'n';

    // XRP Configuration
    if (configureXRP) {
        console.log('\n' + '-'.repeat(60));
        console.log('XRP LEDGER CONFIGURATION');
        console.log('-'.repeat(60));
        config.XRPL_NETWORK = await question('XRPL Network [wss://s.altnet.rippletest.net:51233]: ') || 'wss://s.altnet.rippletest.net:51233';
        config.XRPL_PRIVATE_KEY = await question('XRPL Private Key: ');
        if (!config.XRPL_PRIVATE_KEY) {
            console.log('⚠️  Skipping XRPL - no private key provided');
            delete config.XRPL_NETWORK;
            delete config.XRPL_PRIVATE_KEY;
        }
    }

    // Ethereum Configuration
    if (configureETH) {
        console.log('\n' + '-'.repeat(60));
        console.log('ETHEREUM CONFIGURATION');
        console.log('-'.repeat(60));
        config.ETH_RPC_URL = await question('Ethereum RPC URL [https://sepolia.infura.io/v3/YOUR_KEY]: ') || 'https://sepolia.infura.io/v3/YOUR_KEY';
        config.ETH_PRIVATE_KEY = await question('Ethereum Private Key: ');
        if (!config.ETH_PRIVATE_KEY) {
            console.log('⚠️  Skipping Ethereum - no private key provided');
            delete config.ETH_RPC_URL;
            delete config.ETH_PRIVATE_KEY;
        }
    }

    // Solana Configuration
    if (configureSOL) {
        console.log('\n' + '-'.repeat(60));
        console.log('SOLANA CONFIGURATION');
        console.log('-'.repeat(60));
        config.SOLANA_RPC_URL = await question('Solana RPC URL [https://api.devnet.solana.com]: ') || 'https://api.devnet.solana.com';
        config.SOLANA_PRIVATE_KEY = await question('Solana Private Key: ');
        if (!config.SOLANA_PRIVATE_KEY) {
            console.log('⚠️  Skipping Solana - no private key provided');
            delete config.SOLANA_RPC_URL;
            delete config.SOLANA_PRIVATE_KEY;
        }
    }

    // Bitcoin Configuration
    if (configureBTC) {
        console.log('\n' + '-'.repeat(60));
        console.log('BITCOIN CONFIGURATION');
        console.log('-'.repeat(60));
        config.BTC_NETWORK = await question('Bitcoin Network [testnet]: ') || 'testnet';
        config.BTC_PRIVATE_KEY = await question('Bitcoin Private Key: ');
        if (!config.BTC_PRIVATE_KEY) {
            console.log('⚠️  Skipping Bitcoin - no private key provided');
            delete config.BTC_NETWORK;
            delete config.BTC_PRIVATE_KEY;
        }
    }

    // Optional settings
    console.log('\n' + '-'.repeat(60));
    console.log('OPTIONAL SETTINGS');
    console.log('-'.repeat(60));
    config.DEMO_ACCOUNT_NUMBER = await question('Demo Account Number (optional): ') || '0x0000000000000000000000000000000000000000';
    config.DEBUG = (await question('Enable debug mode? (y/N): ')).toLowerCase() === 'y' ? 'true' : 'false';

    // Generate .env file
    let envContent = '# Demos Vibe Starter Kit Configuration\n';
    envContent += '# Generated by setup wizard\n\n';

    envContent += '# Demos Network\n';
    envContent += `DEMOS_RPC_URL=${config.DEMOS_RPC_URL}\n\n`;

    if (config.XRPL_NETWORK) {
        envContent += '# XRP Ledger\n';
        envContent += `XRPL_NETWORK=${config.XRPL_NETWORK}\n`;
        envContent += `XRPL_PRIVATE_KEY=${config.XRPL_PRIVATE_KEY}\n\n`;
    }

    if (config.ETH_RPC_URL) {
        envContent += '# Ethereum\n';
        envContent += `ETH_RPC_URL=${config.ETH_RPC_URL}\n`;
        envContent += `ETH_PRIVATE_KEY=${config.ETH_PRIVATE_KEY}\n\n`;
    }

    if (config.SOLANA_RPC_URL) {
        envContent += '# Solana\n';
        envContent += `SOLANA_RPC_URL=${config.SOLANA_RPC_URL}\n`;
        envContent += `SOLANA_PRIVATE_KEY=${config.SOLANA_PRIVATE_KEY}\n\n`;
    }

    if (config.BTC_NETWORK) {
        envContent += '# Bitcoin\n';
        envContent += `BTC_NETWORK=${config.BTC_NETWORK}\n`;
        envContent += `BTC_PRIVATE_KEY=${config.BTC_PRIVATE_KEY}\n\n`;
    }

    envContent += '# Optional\n';
    envContent += `DEMO_ACCOUNT_NUMBER=${config.DEMO_ACCOUNT_NUMBER}\n`;
    envContent += `DEBUG=${config.DEBUG}\n`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    displaySuccess('.env file created successfully!');

    // Summary
    console.log('📊 Configuration Summary:');
    console.log('─'.repeat(50));
    console.log(`✓ Demos Network configured`);
    if (config.XRPL_NETWORK) console.log(`✓ XRP Ledger configured`);
    if (config.ETH_RPC_URL) console.log(`✓ Ethereum configured`);
    if (config.SOLANA_RPC_URL) console.log(`✓ Solana configured`);
    if (config.BTC_NETWORK) console.log(`✓ Bitcoin configured`);
    console.log('─'.repeat(50));

    console.log('\n🎉 Setup complete! You\'re ready to vibe code!\n');
    console.log('Next steps:');
    console.log('  1. Run `npm start` to launch the interactive menu');
    console.log('  2. Or run `npm run hello` for your first Demos connection');
    console.log('  3. Run `npm run validate` to verify your configuration\n');

    rl.close();
}

// Run wizard
setupWizard().catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
});
