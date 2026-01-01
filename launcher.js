require('dotenv').config();
const readline = require('readline');
const path = require('path');
const fs = require('fs');

/**
 * Interactive Launcher for Demos Vibe Starter Kit
 *
 * Provides a friendly menu interface for beginners to explore
 * all the examples and utilities.
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function displayBanner() {
    console.log('\n' + '═'.repeat(60));
    console.log('  🚀 DEMOS VIBE STARTER KIT 🚀');
    console.log('  Your Gateway to Multi-Chain Vibe Coding');
    console.log('═'.repeat(60) + '\n');
}

function displayMenu() {
    console.log('📚 Choose an option:\n');
    console.log('  [1] 👋 Hello Demos - Connect to Demos Network');
    console.log('  [2] 💎 Send XRP Transaction');
    console.log('  [3] ⟠  Send Ethereum Transaction');
    console.log('  [4] ◎  Send Solana Transaction');
    console.log('  [5] ₿  Send Bitcoin Transaction');
    console.log('  [6] 🌐 Multi-Chain Demo (Run All)');
    console.log('  [7] ⚙️  Run Setup Wizard');
    console.log('  [8] ✅ Validate Configuration');
    console.log('  [9] 📖 View Documentation');
    console.log('  [0] 🚪 Exit\n');
}

function checkConfigFile() {
    const envPath = path.join(process.cwd(), '.env');
    return fs.existsSync(envPath);
}

async function runExample(examplePath, name) {
    try {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`  Running: ${name}`);
        console.log('═'.repeat(60) + '\n');

        const example = require(examplePath);
        await example();

        console.log('\n✅ Example completed successfully!\n');
    } catch (error) {
        console.error(`\n❌ Example failed: ${error.message}\n`);
        console.log('💡 Try running `npm run validate` to check your configuration\n');
    }
}

async function showDocumentation() {
    console.log('\n' + '─'.repeat(60));
    console.log('📖 DOCUMENTATION');
    console.log('─'.repeat(60) + '\n');

    const docsPath = path.join(process.cwd(), 'docs', 'getting-started.md');
    if (fs.existsSync(docsPath)) {
        const content = fs.readFileSync(docsPath, 'utf8');
        console.log(content);
    } else {
        console.log('Documentation files:');
        console.log('  - README.md - Main documentation');
        console.log('  - docs/getting-started.md - Getting started guide');
        console.log('  - docs/troubleshooting.md - Troubleshooting help\n');
        console.log('View them in your editor or at:');
        console.log('  https://github.com/demos-community/demos-vibe-starter-kit\n');
    }
}

async function mainLoop() {
    let running = true;

    while (running) {
        displayMenu();

        const choice = await question('Enter your choice: ');

        switch (choice.trim()) {
            case '1':
                await runExample('./examples/01-hello-demos.js', 'Hello Demos');
                break;

            case '2':
                await runExample('./examples/02-xrp-transaction.js', 'XRP Transaction');
                break;

            case '3':
                await runExample('./examples/03-ethereum-transaction.js', 'Ethereum Transaction');
                break;

            case '4':
                await runExample('./examples/04-solana-transaction.js', 'Solana Transaction');
                break;

            case '5':
                await runExample('./examples/05-bitcoin-transaction.js', 'Bitcoin Transaction');
                break;

            case '6':
                await runExample('./examples/06-multi-chain-demo.js', 'Multi-Chain Demo');
                break;

            case '7':
                console.log('\n🔧 Launching setup wizard...\n');
                rl.close();
                require('./setup-wizard.js');
                running = false;
                break;

            case '8':
                console.log('\n🔍 Validating configuration...\n');
                const ConfigValidator = require('./utils/config-validator.js');
                const validator = new ConfigValidator();
                validator.validate();
                break;

            case '9':
                await showDocumentation();
                break;

            case '0':
                console.log('\n👋 Thanks for using Demos Vibe Starter Kit!');
                console.log('Happy vibe coding! 🎉\n');
                running = false;
                rl.close();
                break;

            default:
                console.log('\n❌ Invalid choice. Please try again.\n');
        }

        if (running && choice !== '7') {
            await question('\nPress Enter to continue...');
            console.clear();
            displayBanner();
        }
    }
}

async function main() {
    console.clear();
    displayBanner();

    // Check if configuration exists
    if (!checkConfigFile()) {
        console.log('⚠️  No configuration found!\n');
        console.log('It looks like this is your first time running the starter kit.');
        console.log('Let\'s set up your environment first.\n');

        const runSetup = await question('Run setup wizard now? (Y/n): ');
        if (runSetup.toLowerCase() !== 'n') {
            console.log('\n🔧 Launching setup wizard...\n');
            rl.close();
            require('./setup-wizard.js');
            return;
        } else {
            console.log('\n💡 You can run setup anytime with: npm run setup\n');
        }
    }

    await mainLoop();
}

// Run launcher
main().catch(error => {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
});
