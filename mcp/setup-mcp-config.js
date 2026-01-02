const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * MCP Auto-Configurator for Claude Code
 *
 * Automatically detects and configures Claude Code MCP servers
 * for both Demos Network and DemoSDK API documentation.
 */

class MCPConfigurator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.claudeConfigDir = path.join(os.homedir(), '.claude');
        this.claudeConfigFile = path.join(this.claudeConfigDir, 'mcp.json');
    }

    /**
     * Detect if Claude Code is installed
     * @returns {boolean} True if Claude Code config directory exists
     */
    isClaudeCodeInstalled() {
        return fs.existsSync(this.claudeConfigDir);
    }

    /**
     * Create Claude Code config directory if it doesn't exist
     * @returns {boolean} True if successful
     */
    ensureConfigDirectory() {
        if (!fs.existsSync(this.claudeConfigDir)) {
            try {
                fs.mkdirSync(this.claudeConfigDir, { recursive: true });
                console.log(`✓ Created Claude Code config directory: ${this.claudeConfigDir}`);
                return true;
            } catch (error) {
                console.error(`✗ Failed to create directory: ${error.message}`);
                return false;
            }
        }
        return true;
    }

    /**
     * Get absolute path and normalize for cross-platform compatibility
     * @param {string} relativePath Relative path from project root
     * @returns {string} Normalized absolute path
     */
    getAbsolutePath(relativePath) {
        const absolutePath = path.join(this.projectRoot, relativePath);
        // Normalize to forward slashes for JSON compatibility
        return absolutePath.replace(/\\/g, '/');
    }

    /**
     * Backup existing config file
     * @returns {boolean} True if backup successful or not needed
     */
    backupExistingConfig() {
        if (fs.existsSync(this.claudeConfigFile)) {
            const backupFile = this.claudeConfigFile + '.backup';
            try {
                // Only backup if no backup exists yet
                if (!fs.existsSync(backupFile)) {
                    fs.copyFileSync(this.claudeConfigFile, backupFile);
                    console.log(`✓ Backed up existing config to: ${backupFile}`);
                }
                return true;
            } catch (error) {
                console.error(`⚠️  Failed to backup config: ${error.message}`);
                return false;
            }
        }
        return true;
    }

    /**
     * Load existing MCP configuration
     * @returns {Object} Existing config or empty config object
     */
    loadExistingConfig() {
        if (fs.existsSync(this.claudeConfigFile)) {
            try {
                const content = fs.readFileSync(this.claudeConfigFile, 'utf8');
                return JSON.parse(content);
            } catch (error) {
                console.error(`⚠️  Error reading existing config: ${error.message}`);
                console.error('    Creating new configuration instead');
                return { mcpServers: {} };
            }
        }
        return { mcpServers: {} };
    }

    /**
     * Create Demos MCP servers configuration
     * @returns {Object} MCP servers configuration
     */
    createDemosServers() {
        const demosServerPath = this.getAbsolutePath('mcp/demos-mcp-server.js');
        const docsServerPath = this.getAbsolutePath('mcp/demosdk-docs-mcp-server.js');

        return {
            'demos-network': {
                command: 'node',
                args: [demosServerPath],
                env: {
                    DEMOS_RPC_URL: 'https://rpc.demos.network',
                    XRPL_NETWORK: 'wss://s.altnet.rippletest.net:51233'
                }
            },
            'demosdk-docs': {
                command: 'node',
                args: [docsServerPath]
            }
        };
    }

    /**
     * Merge new servers with existing configuration
     * @param {Object} existingConfig Existing configuration
     * @param {Object} newServers New servers to add
     * @returns {Object} Merged configuration
     */
    mergeConfig(existingConfig, newServers) {
        const config = { ...existingConfig };

        if (!config.mcpServers) {
            config.mcpServers = {};
        }

        // Add or update Demos servers
        for (const [serverName, serverConfig] of Object.entries(newServers)) {
            config.mcpServers[serverName] = serverConfig;
        }

        return config;
    }

    /**
     * Write configuration to file
     * @param {Object} config Configuration object
     * @returns {boolean} True if successful
     */
    writeConfig(config) {
        try {
            const configJSON = JSON.stringify(config, null, 2);
            fs.writeFileSync(this.claudeConfigFile, configJSON, 'utf8');
            return true;
        } catch (error) {
            console.error(`✗ Failed to write config: ${error.message}`);
            return false;
        }
    }

    /**
     * Save config template to project directory (fallback)
     * @param {Object} config Configuration object
     * @returns {string} Path to template file
     */
    saveConfigTemplate(config) {
        const templatePath = path.join(this.projectRoot, 'mcp-config-template.json');

        try {
            const configJSON = JSON.stringify(config, null, 2);
            fs.writeFileSync(templatePath, configJSON, 'utf8');
            return templatePath;
        } catch (error) {
            console.error(`✗ Failed to save template: ${error.message}`);
            return null;
        }
    }

    /**
     * Main configuration process
     * @returns {Promise<Object>} Result object with success status and details
     */
    async configure() {
        console.log('\n⚙️  Configuring Claude Code MCP Servers\n');
        console.log('='.repeat(60));

        // Step 1: Check if Claude Code is installed
        const claudeInstalled = this.isClaudeCodeInstalled();

        if (!claudeInstalled) {
            console.log('⚠️  Claude Code config directory not found');
            console.log(`   Expected location: ${this.claudeConfigDir}`);
            console.log('\n   Attempting to create directory...\n');

            if (!this.ensureConfigDirectory()) {
                console.log('\n❌ Cannot create Claude Code config directory');
                console.log('   Saving configuration template instead...\n');

                const newServers = this.createDemosServers();
                const config = { mcpServers: newServers };
                const templatePath = this.saveConfigTemplate(config);

                if (templatePath) {
                    console.log(`✓ Configuration saved to: ${templatePath}`);
                    console.log('\n📋 Manual Setup Instructions:');
                    console.log(`   1. Install Claude Code: https://claude.ai/code`);
                    console.log(`   2. Create directory: ${this.claudeConfigDir}`);
                    console.log(`   3. Copy ${templatePath}`);
                    console.log(`      to: ${this.claudeConfigFile}`);
                    console.log(`   4. Restart Claude Code\n`);
                }

                return {
                    success: false,
                    installedClaudeCode: false,
                    templatePath
                };
            }
        }

        // Step 2: Backup existing config
        this.backupExistingConfig();

        // Step 3: Load existing configuration
        console.log('Loading existing configuration...');
        const existingConfig = this.loadExistingConfig();

        // Step 4: Create Demos servers configuration
        const demosServers = this.createDemosServers();

        // Step 5: Merge configurations
        const mergedConfig = this.mergeConfig(existingConfig, demosServers);

        // Step 6: Write configuration
        console.log('Writing MCP configuration...');

        if (!this.writeConfig(mergedConfig)) {
            console.log('\n❌ Failed to write configuration');
            const templatePath = this.saveConfigTemplate(mergedConfig);

            if (templatePath) {
                console.log(`✓ Configuration saved to: ${templatePath}`);
                console.log(`\n💡 Manually copy this file to: ${this.claudeConfigFile}\n`);
            }

            return {
                success: false,
                installedClaudeCode: claudeInstalled,
                templatePath
            };
        }

        // Success!
        console.log(`✓ MCP configuration written to: ${this.claudeConfigFile}`);

        console.log('\n📊 Configured MCP Servers:');
        console.log('  ✓ demos-network - Demos Network blockchain tools');
        console.log('  ✓ demosdk-docs - DemoSDK API documentation search');

        // Show other configured servers
        const otherServers = Object.keys(mergedConfig.mcpServers).filter(
            name => !['demos-network', 'demosdk-docs'].includes(name)
        );

        if (otherServers.length > 0) {
            console.log(`\n  ℹ️  Preserved ${otherServers.length} existing server(s): ${otherServers.join(', ')}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ MCP configuration complete!');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart Claude Code (exit and start again)');
        console.log('   2. Verify servers with: claude mcp list');
        console.log('   3. Test with: "Connect to Demos Network"');
        console.log('   4. Or search docs: "Search Demos SDK for connect method"\n');

        return {
            success: true,
            installedClaudeCode: claudeInstalled,
            configFile: this.claudeConfigFile,
            servers: Object.keys(demosServers)
        };
    }
}

// Run if called directly
if (require.main === module) {
    const configurator = new MCPConfigurator();

    configurator.configure()
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Error configuring MCP:', error);
            process.exit(1);
        });
}

module.exports = MCPConfigurator;
