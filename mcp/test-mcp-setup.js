const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * MCP Setup Validator
 *
 * Tests that MCP servers are configured correctly and can start successfully.
 */

class MCPValidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.claudeConfigFile = path.join(os.homedir(), '.claude', 'mcp.json');
        this.results = {
            configExists: false,
            serversConfigured: [],
            serverFiles: [],
            serversStarted: [],
            errors: []
        };
    }

    /**
     * Check if Claude Code configuration exists
     * @returns {boolean} True if config file exists
     */
    checkClaudeCodeConfig() {
        console.log('\n🔍 Checking Claude Code configuration...\n');

        if (fs.existsSync(this.claudeConfigFile)) {
            console.log(`✓ Config file found: ${this.claudeConfigFile}`);
            this.results.configExists = true;
            return true;
        } else {
            console.log(`✗ Config file not found: ${this.claudeConfigFile}`);
            console.log('  Run: npm run quickstart to configure');
            this.results.errors.push('Claude Code config file not found');
            return false;
        }
    }

    /**
     * Validate MCP server configuration
     * @returns {boolean} True if validation passed
     */
    validateServerConfiguration() {
        if (!this.results.configExists) {
            return false;
        }

        console.log('\n🔍 Validating MCP server configuration...\n');

        try {
            const configContent = fs.readFileSync(this.claudeConfigFile, 'utf8');
            const config = JSON.parse(configContent);

            if (!config.mcpServers) {
                console.log('✗ No mcpServers section found in config');
                this.results.errors.push('Missing mcpServers section');
                return false;
            }

            // Check for Demos servers
            const requiredServers = ['demos-network', 'demosdk-docs'];

            for (const serverName of requiredServers) {
                if (config.mcpServers[serverName]) {
                    console.log(`✓ Server configured: ${serverName}`);
                    this.results.serversConfigured.push(serverName);
                } else {
                    console.log(`✗ Server not configured: ${serverName}`);
                    this.results.errors.push(`Missing server: ${serverName}`);
                }
            }

            return this.results.serversConfigured.length === requiredServers.length;

        } catch (error) {
            console.log(`✗ Error reading config: ${error.message}`);
            this.results.errors.push(`Config parse error: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate server file paths exist
     * @returns {boolean} True if all server files exist
     */
    validateServerPaths() {
        console.log('\n🔍 Validating server file paths...\n');

        const serverPaths = {
            'demos-network': path.join(this.projectRoot, 'mcp/demos-mcp-server.js'),
            'demosdk-docs': path.join(this.projectRoot, 'mcp/demosdk-docs-mcp-server.js')
        };

        let allExist = true;

        for (const [serverName, serverPath] of Object.entries(serverPaths)) {
            if (fs.existsSync(serverPath)) {
                console.log(`✓ Server file exists: ${serverName}`);
                console.log(`  ${serverPath}`);
                this.results.serverFiles.push(serverName);
            } else {
                console.log(`✗ Server file missing: ${serverName}`);
                console.log(`  Expected: ${serverPath}`);
                this.results.errors.push(`Missing file: ${serverPath}`);
                allExist = false;
            }
        }

        return allExist;
    }

    /**
     * Test starting an MCP server
     * @param {string} serverPath Path to server file
     * @param {string} serverName Server name for logging
     * @returns {Promise<boolean>} True if server starts successfully
     */
    testServerStart(serverPath, serverName) {
        return new Promise((resolve) => {
            console.log(`\n🧪 Testing ${serverName}...`);

            const serverProcess = spawn('node', [serverPath], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let output = '';
            let errorOutput = '';
            let resolved = false;

            // Timeout after 5 seconds
            const timeout = setTimeout(() => {
                if (!resolved) {
                    serverProcess.kill();
                    console.log(`✓ ${serverName} started successfully (timed out after initialization)`);
                    this.results.serversStarted.push(serverName);
                    resolved = true;
                    resolve(true);
                }
            }, 5000);

            serverProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            serverProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();

                // Look for successful initialization message
                if (errorOutput.includes('running on stdio') || errorOutput.includes('MCP Server')) {
                    if (!resolved) {
                        clearTimeout(timeout);
                        serverProcess.kill();
                        console.log(`✓ ${serverName} started successfully`);
                        this.results.serversStarted.push(serverName);
                        resolved = true;
                        resolve(true);
                    }
                }
            });

            serverProcess.on('error', (error) => {
                if (!resolved) {
                    clearTimeout(timeout);
                    console.log(`✗ ${serverName} failed to start: ${error.message}`);
                    this.results.errors.push(`${serverName}: ${error.message}`);
                    resolved = true;
                    resolve(false);
                }
            });

            serverProcess.on('close', (code) => {
                if (!resolved) {
                    clearTimeout(timeout);

                    if (code === 0 || code === null) {
                        console.log(`✓ ${serverName} started and exited cleanly`);
                        this.results.serversStarted.push(serverName);
                        resolved = true;
                        resolve(true);
                    } else {
                        console.log(`✗ ${serverName} exited with code: ${code}`);
                        if (errorOutput) {
                            console.log(`   Error: ${errorOutput.substring(0, 200)}`);
                        }
                        this.results.errors.push(`${serverName} exited with code ${code}`);
                        resolved = true;
                        resolve(false);
                    }
                }
            });
        });
    }

    /**
     * Test starting all MCP servers
     * @returns {Promise<boolean>} True if all servers start successfully
     */
    async testAllServers() {
        console.log('\n🧪 Testing MCP server startup...');

        const serverPaths = {
            'demos-network': path.join(this.projectRoot, 'mcp/demos-mcp-server.js'),
            'demosdk-docs': path.join(this.projectRoot, 'mcp/demosdk-docs-mcp-server.js')
        };

        let allStarted = true;

        for (const [serverName, serverPath] of Object.entries(serverPaths)) {
            if (fs.existsSync(serverPath)) {
                const started = await this.testServerStart(serverPath, serverName);
                if (!started) {
                    allStarted = false;
                }
            }
        }

        return allStarted;
    }

    /**
     * Generate validation report
     * @returns {string} Formatted report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 MCP Setup Validation Report');
        console.log('='.repeat(60) + '\n');

        // Configuration
        console.log('Configuration:');
        console.log(`  Config file: ${this.results.configExists ? '✓' : '✗'}`);
        console.log(`  Servers configured: ${this.results.serversConfigured.length}/2`);
        if (this.results.serversConfigured.length > 0) {
            this.results.serversConfigured.forEach(server => {
                console.log(`    ✓ ${server}`);
            });
        }

        // Files
        console.log('\nServer Files:');
        console.log(`  Files present: ${this.results.serverFiles.length}/2`);
        if (this.results.serverFiles.length > 0) {
            this.results.serverFiles.forEach(server => {
                console.log(`    ✓ ${server}`);
            });
        }

        // Startup tests
        console.log('\nStartup Tests:');
        console.log(`  Servers started: ${this.results.serversStarted.length}/2`);
        if (this.results.serversStarted.length > 0) {
            this.results.serversStarted.forEach(server => {
                console.log(`    ✓ ${server}`);
            });
        }

        // Errors
        if (this.results.errors.length > 0) {
            console.log('\nErrors:');
            this.results.errors.forEach(error => {
                console.log(`  ✗ ${error}`);
            });
        }

        // Overall status
        const allPassed = this.results.configExists &&
                         this.results.serversConfigured.length === 2 &&
                         this.results.serverFiles.length === 2 &&
                         this.results.serversStarted.length === 2 &&
                         this.results.errors.length === 0;

        console.log('\n' + '='.repeat(60));

        if (allPassed) {
            console.log('✅ All tests passed! MCP setup is working correctly.\n');
            console.log('Next steps:');
            console.log('  1. Restart Claude Code');
            console.log('  2. Try: "Connect to Demos Network"');
            console.log('  3. Try: "Search Demos SDK docs for connect"\n');
        } else {
            console.log('❌ Some tests failed. Please review errors above.\n');
            console.log('Troubleshooting:');
            console.log('  1. Run: npm run quickstart');
            console.log('  2. Make sure Claude Code is installed');
            console.log('  3. Check that all dependencies are installed: npm install\n');
        }

        return allPassed;
    }

    /**
     * Main validation process
     * @returns {Promise<boolean>} True if all validations passed
     */
    async validate() {
        console.log('\n🔬 MCP Setup Validator\n');
        console.log('='.repeat(60));

        // Step 1: Check Claude Code config
        this.checkClaudeCodeConfig();

        // Step 2: Validate configuration
        this.validateServerConfiguration();

        // Step 3: Validate server paths
        this.validateServerPaths();

        // Step 4: Test server startup
        await this.testAllServers();

        // Step 5: Generate report
        return this.generateReport();
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new MCPValidator();

    validator.validate()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Validation error:', error);
            process.exit(1);
        });
}

module.exports = MCPValidator;
