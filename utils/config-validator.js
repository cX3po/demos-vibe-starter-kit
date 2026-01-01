require('dotenv').config();
const fs = require('fs');
const path = require('path');

class ConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    validate() {
        console.log('\n🔍 Validating Demos Vibe Starter Kit Configuration...\n');

        this.checkEnvFile();
        this.checkRequiredVars();
        this.checkOptionalVars();
        this.checkPrivateKeys();
        this.displayResults();

        return this.errors.length === 0;
    }

    checkEnvFile() {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            this.errors.push('.env file not found. Run `npm run setup` to create one.');
        } else {
            this.info.push('✓ .env file found');
        }
    }

    checkRequiredVars() {
        const required = ['DEMOS_RPC_URL'];

        required.forEach(varName => {
            if (!process.env[varName]) {
                this.errors.push(`Missing required variable: ${varName}`);
            } else {
                this.info.push(`✓ ${varName} is set`);
            }
        });
    }

    checkOptionalVars() {
        const chains = {
            'XRPL': ['XRPL_NETWORK', 'XRPL_PRIVATE_KEY'],
            'Ethereum': ['ETH_RPC_URL', 'ETH_PRIVATE_KEY'],
            'Solana': ['SOLANA_RPC_URL', 'SOLANA_PRIVATE_KEY'],
            'Bitcoin': ['BTC_NETWORK', 'BTC_PRIVATE_KEY']
        };

        Object.entries(chains).forEach(([chainName, vars]) => {
            const hasAll = vars.every(v => process.env[v]);
            const hasNone = vars.every(v => !process.env[v]);
            const hasSome = vars.some(v => process.env[v]) && !hasAll;

            if (hasAll) {
                this.info.push(`✓ ${chainName} configuration complete`);
            } else if (hasSome) {
                this.warnings.push(`${chainName} configuration incomplete. Set all: ${vars.join(', ')}`);
            } else {
                this.info.push(`⊗ ${chainName} not configured (optional)`);
            }
        });
    }

    checkPrivateKeys() {
        const keyVars = ['XRPL_PRIVATE_KEY', 'ETH_PRIVATE_KEY', 'SOLANA_PRIVATE_KEY', 'BTC_PRIVATE_KEY'];

        keyVars.forEach(varName => {
            if (process.env[varName]) {
                const key = process.env[varName];
                if (key.length < 32) {
                    this.warnings.push(`${varName} seems too short. Make sure it's valid.`);
                }
                if (key === 'your_key_here' || key.includes('example')) {
                    this.errors.push(`${varName} contains placeholder text. Replace with actual key.`);
                }
            }
        });
    }

    displayResults() {
        console.log('📋 Validation Results:\n');

        if (this.info.length > 0) {
            console.log('ℹ️  INFO:');
            this.info.forEach(msg => console.log(`   ${msg}`));
            console.log('');
        }

        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(msg => console.log(`   ${msg}`));
            console.log('');
        }

        if (this.errors.length > 0) {
            console.log('❌ ERRORS:');
            this.errors.forEach(msg => console.log(`   ${msg}`));
            console.log('');
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ Configuration looks good! You\'re ready to vibe code!\n');
            console.log('Run `npm start` to launch the interactive menu\n');
        } else if (this.errors.length === 0) {
            console.log('⚠️  Configuration valid but has warnings. You can proceed but some features may not work.\n');
        } else {
            console.log('❌ Configuration has errors. Please fix them before proceeding.\n');
            console.log('Run `npm run setup` for interactive configuration help.\n');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ConfigValidator();
    const isValid = validator.validate();
    process.exit(isValid ? 0 : 1);
}

module.exports = ConfigValidator;
