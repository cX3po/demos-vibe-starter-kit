require('dotenv').config();
const { demos, DemosWebAuth } = require("@kynesyslabs/demosdk/websdk");

/**
 * Health Check Utility
 *
 * Performs a comprehensive health check of the Demos Vibe Starter Kit
 * environment, including network connectivity and configuration validity.
 */

class HealthChecker {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    async runAllChecks() {
        console.log('\n🏥 Running Health Check...\n');

        await this.checkNodeVersion();
        await this.checkConfigFile();
        await this.checkDependencies();
        await this.checkDemosConnectivity();

        this.displayResults();
    }

    checkNodeVersion() {
        const version = process.version;
        const major = parseInt(version.split('.')[0].replace('v', ''));

        if (major >= 16) {
            this.results.passed.push(`Node.js version ${version} is supported`);
        } else {
            this.results.failed.push(`Node.js version ${version} is too old. Requires v16+`);
        }
    }

    checkConfigFile() {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env');

        if (fs.existsSync(envPath)) {
            this.results.passed.push('.env configuration file found');
        } else {
            this.results.failed.push('.env file not found. Run `npm run setup`');
        }
    }

    checkDependencies() {
        const requiredModules = [
            '@kynesyslabs/demosdk',
            'dotenv'
        ];

        requiredModules.forEach(module => {
            try {
                require.resolve(module);
                this.results.passed.push(`Dependency ${module} is installed`);
            } catch (error) {
                this.results.failed.push(`Missing dependency: ${module}. Run npm install`);
            }
        });
    }

    async checkDemosConnectivity() {
        try {
            const rpcUrl = process.env.DEMOS_RPC_URL;

            if (!rpcUrl) {
                this.results.failed.push('DEMOS_RPC_URL not configured');
                return;
            }

            // Try to create identity and connect
            const identity = DemosWebAuth.getInstance();
            await identity.create();

            await demos.connect(rpcUrl);
            await demos.connectWallet(identity.keypair.privateKey);

            this.results.passed.push('Successfully connected to Demos Network');
        } catch (error) {
            this.results.failed.push(`Demos Network connection failed: ${error.message}`);
        }
    }

    displayResults() {
        console.log('\n📊 Health Check Results:\n');

        if (this.results.passed.length > 0) {
            console.log('✅ PASSED:');
            this.results.passed.forEach(msg => console.log(`   • ${msg}`));
            console.log('');
        }

        if (this.results.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.results.warnings.forEach(msg => console.log(`   • ${msg}`));
            console.log('');
        }

        if (this.results.failed.length > 0) {
            console.log('❌ FAILED:');
            this.results.failed.forEach(msg => console.log(`   • ${msg}`));
            console.log('');
        }

        // Overall status
        if (this.results.failed.length === 0) {
            console.log('🎉 All health checks passed! Your environment is ready to go!\n');
            console.log('💡 Next steps:');
            console.log('   - Run `npm start` to launch the interactive menu');
            console.log('   - Or run `npm run hello` for your first Demos connection\n');
            process.exit(0);
        } else {
            console.log('❌ Some health checks failed. Please fix the issues above.\n');
            console.log('💡 Need help?');
            console.log('   - Run `npm run setup` to reconfigure your environment');
            console.log('   - Check the troubleshooting guide: docs/troubleshooting.md\n');
            process.exit(1);
        }
    }
}

// Run health check if called directly
if (require.main === module) {
    const checker = new HealthChecker();
    checker.runAllChecks().catch(error => {
        console.error('\n❌ Health check failed:', error.message);
        process.exit(1);
    });
}

module.exports = HealthChecker;
