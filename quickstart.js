#!/usr/bin/env node

const readline = require('readline');
const DocumentationUpdater = require('./mcp/docs/update-docs');
const MCPConfigurator = require('./mcp/setup-mcp-config');
const MCPValidator = require('./mcp/test-mcp-setup');

/**
 * Demos SDK Quick Start
 *
 * One-command setup to get vibe coding with Demos SDK and Claude Code MCP integration.
 * No manual configuration needed - everything is automated!
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Display welcome banner
 */
function displayBanner() {
    console.clear();
    console.log('\n' + '='.repeat(70));
    console.log('  🚀 DEMOS SDK QUICK START');
    console.log('  Get vibe coding in minutes, not hours!');
    console.log('='.repeat(70) + '\n');
}

/**
 * Check Node.js version
 * @returns {boolean} True if version is compatible
 */
function checkEnvironment() {
    console.log('📋 Step 1/5: Checking environment...\n');

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

    console.log(`   Node.js version: ${nodeVersion}`);

    if (majorVersion < 16) {
        console.log('   ✗ Node.js 16 or higher is required');
        console.log('   Please upgrade Node.js: https://nodejs.org/\n');
        return false;
    }

    console.log('   ✓ Node.js version compatible\n');
    return true;
}

/**
 * Generate documentation from SDK
 * @returns {Promise<boolean>} True if successful
 */
async function generateDocs() {
    console.log('📚 Step 2/5: Generating DemoSDK documentation...\n');

    try {
        const updater = new DocumentationUpdater();
        const result = await updater.update();

        if (result.success) {
            console.log('   ✓ Documentation generated successfully\n');
            return true;
        } else {
            console.log('   ⚠️  Documentation generation had issues, but continuing...\n');
            return true; // Continue anyway
        }
    } catch (error) {
        console.log(`   ⚠️  Documentation generation failed: ${error.message}`);
        console.log('   Continuing with setup (you can run `npm run update-docs` later)...\n');
        return true; // Continue anyway
    }
}

/**
 * Configure Claude Code MCP servers
 * @returns {Promise<boolean>} True if successful
 */
async function configureMCP() {
    console.log('⚙️  Step 3/5: Configuring Claude Code MCP servers...\n');

    try {
        const configurator = new MCPConfigurator();
        const result = await configurator.configure();

        if (result.success) {
            console.log('   ✓ MCP servers configured successfully\n');
            return true;
        } else {
            console.log('   ⚠️  MCP configuration needs manual setup\n');
            if (result.templatePath) {
                console.log(`   Configuration template saved to: ${result.templatePath}\n`);
            }
            return false;
        }
    } catch (error) {
        console.log(`   ✗ MCP configuration failed: ${error.message}\n`);
        return false;
    }
}

/**
 * Test MCP servers
 * @returns {Promise<boolean>} True if all tests passed
 */
async function testMCPServers() {
    console.log('🧪 Step 4/5: Testing MCP servers...\n');

    try {
        const validator = new MCPValidator();

        // Run minimal validation (just check files exist, don't start servers)
        validator.checkClaudeCodeConfig();
        validator.validateServerConfiguration();
        const filesExist = validator.validateServerPaths();

        if (filesExist) {
            console.log('   ✓ MCP server files validated\n');
            return true;
        } else {
            console.log('   ⚠️  Some MCP server files missing\n');
            return false;
        }
    } catch (error) {
        console.log(`   ⚠️  Validation skipped: ${error.message}\n`);
        return true; // Don't block on validation errors
    }
}

/**
 * Display success message and next steps
 * @param {boolean} mcpConfigured Whether MCP was successfully configured
 */
function displaySuccess(mcpConfigured) {
    console.log('🎉 Step 5/5: Setup complete!\n');
    console.log('='.repeat(70));

    if (mcpConfigured) {
        console.log('\n✅ Everything is set up! You\'re ready to vibe code!\n');
        console.log('📋 Next steps:\n');
        console.log('   1. Restart Claude Code:');
        console.log('      - Exit current session');
        console.log('      - Start Claude Code again\n');
        console.log('   2. Try these commands in Claude Code:');
        console.log('      - "Connect to Demos Network"');
        console.log('      - "Search Demos SDK docs for connect method"');
        console.log('      - "Show me all DemoSDK classes"\n');
        console.log('   3. Or run the interactive launcher:');
        console.log('      npm start\n');
        console.log('   4. Run your first example:');
        console.log('      npm run hello\n');
    } else {
        console.log('\n⚠️  Setup completed with manual steps required\n');
        console.log('📋 To complete setup:\n');
        console.log('   1. Install Claude Code: https://claude.ai/code');
        console.log('   2. Copy the config template to ~/.claude/mcp.json');
        console.log('   3. Run: npm run test-mcp to verify\n');
        console.log('   Or try the examples without MCP:');
        console.log('      npm start          (interactive launcher)');
        console.log('      npm run hello      (first example)\n');
    }

    console.log('='.repeat(70));
    console.log('\n💡 Helpful commands:\n');
    console.log('   npm start           - Interactive launcher');
    console.log('   npm run update-docs - Regenerate documentation');
    console.log('   npm run test-mcp    - Validate MCP setup');
    console.log('   npm run setup       - Configure blockchain credentials\n');
    console.log('📖 Documentation: README.md');
    console.log('🐛 Issues: https://github.com/cX3po/demos-vibe-starter-kit/issues\n');
    console.log('Happy vibe coding! 🎊\n');
}

/**
 * Ask if user wants to launch interactive menu
 * @returns {Promise<boolean>} True if user wants to launch
 */
async function promptLaunch() {
    const answer = await question('Launch interactive menu now? (y/N): ');
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Launch interactive menu
 */
function launchMenu() {
    rl.close();
    console.log('\n🚀 Launching interactive menu...\n');
    require('./launcher.js');
}

/**
 * Main quickstart process
 */
async function main() {
    displayBanner();

    // Check for --silent flag
    const silent = process.argv.includes('--silent') || process.argv.includes('-s');

    if (!silent) {
        console.log('This will set up:\n');
        console.log('  ✓ DemoSDK API documentation');
        console.log('  ✓ Claude Code MCP servers');
        console.log('  ✓ Full development environment\n');

        const proceed = await question('Ready to get started? (Y/n): ');

        if (proceed.toLowerCase() === 'n' || proceed.toLowerCase() === 'no') {
            console.log('\nSetup cancelled. Run `npm run quickstart` when ready.\n');
            rl.close();
            return;
        }

        console.log('');
    }

    // Step 1: Check environment
    if (!checkEnvironment()) {
        console.log('❌ Environment check failed. Please fix the issues above.\n');
        rl.close();
        process.exit(1);
    }

    // Step 2: Generate docs
    await generateDocs();

    // Step 3: Configure MCP
    const mcpConfigured = await configureMCP();

    // Step 4: Test MCP
    await testMCPServers();

    // Step 5: Show success
    displaySuccess(mcpConfigured);

    if (!silent) {
        // Ask about launching menu
        const shouldLaunch = await promptLaunch();

        if (shouldLaunch) {
            launchMenu();
        } else {
            console.log('\n👋 Setup complete. Happy coding!\n');
            rl.close();
        }
    } else {
        rl.close();
    }
}

// Run quickstart
main().catch(error => {
    console.error('\n❌ Quickstart failed:', error.message);
    console.error('\nPlease report this issue with the error details above.');
    console.error('GitHub: https://github.com/cX3po/demos-vibe-starter-kit/issues\n');
    rl.close();
    process.exit(1);
});
