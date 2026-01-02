const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const DocumentationParser = require('./parser');

/**
 * Documentation Updater for DemoSDK
 *
 * Generates or updates TypeDoc documentation from the installed SDK.
 * Falls back to source file parsing if TypeDoc fails.
 */

class DocumentationUpdater {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../..');
        this.sdkPath = null;
        this.outputDir = path.join(__dirname, 'demosdk-api-ref');
        this.parser = new DocumentationParser();
    }

    /**
     * Find the installed DemoSDK package
     * @returns {string|null} Path to SDK or null if not found
     */
    findSDKPath() {
        // Try multiple locations
        const possiblePaths = [
            path.join(this.projectRoot, 'node_modules/@kynesyslabs/demosdk'),
            path.join(this.projectRoot, 'node_modules/demos sdk'),
            path.join(__dirname, '../../../@kynesyslabs/demosdk')
        ];

        for (const sdkPath of possiblePaths) {
            if (fs.existsSync(sdkPath)) {
                console.log(`✓ Found DemoSDK at: ${sdkPath}`);
                return sdkPath;
            }
        }

        console.error('✗ DemoSDK not found in node_modules');
        return null;
    }

    /**
     * Check if TypeDoc is installed
     * @returns {boolean} True if TypeDoc is available
     */
    isTypeDocAvailable() {
        const typeDocPath = path.join(this.projectRoot, 'node_modules/.bin/typedoc');
        const typeDocPathCmd = path.join(this.projectRoot, 'node_modules/.bin/typedoc.cmd');

        return fs.existsSync(typeDocPath) || fs.existsSync(typeDocPathCmd);
    }

    /**
     * Run TypeDoc to generate documentation
     * @param {string} sdkPath Path to SDK
     * @returns {Promise<boolean>} True if successful
     */
    async runTypeDoc(sdkPath) {
        return new Promise((resolve) => {
            console.log('\n📚 Generating TypeDoc documentation...');

            // Ensure output directory exists
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }

            // Determine TypeDoc command based on OS
            const isWindows = process.platform === 'win32';
            const typeDocCmd = isWindows ? 'typedoc.cmd' : 'typedoc';
            const typeDocPath = path.join(this.projectRoot, 'node_modules/.bin', typeDocCmd);

            // TypeDoc options
            const args = [
                '--entryPointStrategy', 'expand',
                '--out', this.outputDir,
                sdkPath
            ];

            console.log(`Running: ${typeDocCmd} ${args.join(' ')}`);

            const typeDocProcess = spawn(typeDocPath, args, {
                cwd: this.projectRoot,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: isWindows
            });

            let output = '';
            let errorOutput = '';

            typeDocProcess.stdout.on('data', (data) => {
                output += data.toString();
                process.stdout.write('.');
            });

            typeDocProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            typeDocProcess.on('close', (code) => {
                console.log(''); // New line after dots

                if (code === 0) {
                    console.log('✓ TypeDoc generation successful');
                    resolve(true);
                } else {
                    console.error('✗ TypeDoc generation failed');
                    if (errorOutput) {
                        console.error('Error output:', errorOutput.substring(0, 500));
                    }
                    resolve(false);
                }
            });

            typeDocProcess.on('error', (error) => {
                console.error('✗ Failed to run TypeDoc:', error.message);
                resolve(false);
            });

            // Timeout after 60 seconds
            setTimeout(() => {
                typeDocProcess.kill();
                console.error('✗ TypeDoc generation timed out');
                resolve(false);
            }, 60000);
        });
    }

    /**
     * Parse documentation from TypeDoc output or source files
     * @param {string} sdkPath Path to SDK
     * @param {boolean} useTypedoc Whether TypeDoc was successful
     * @returns {Promise<Object>} Parsed documentation index
     */
    async parseDocumentation(sdkPath, useTypedoc) {
        console.log('\n📖 Parsing documentation...');

        let index;

        if (useTypedoc && fs.existsSync(this.outputDir)) {
            // Parse TypeDoc HTML
            index = await this.parser.parseTypeDocHTML(this.outputDir);
        }

        // If TypeDoc parsing failed or wasn't used, fall back to source files
        if (!index || this.parser.getTotalCount() === 0) {
            console.log('Falling back to source file parsing...');
            index = await this.parser.parseSourceFiles(sdkPath);
        }

        return index;
    }

    /**
     * Verify documentation was generated successfully
     * @returns {boolean} True if documentation exists and is valid
     */
    verifyDocGeneration() {
        if (!fs.existsSync(this.outputDir)) {
            return false;
        }

        // Check for index.html or classes directory
        const hasIndexHTML = fs.existsSync(path.join(this.outputDir, 'index.html'));
        const hasClasses = fs.existsSync(path.join(this.outputDir, 'classes'));
        const hasInterfaces = fs.existsSync(path.join(this.outputDir, 'interfaces'));

        return hasIndexHTML || hasClasses || hasInterfaces;
    }

    /**
     * Save parsed documentation index to JSON file
     * @param {Object} index Parsed documentation index
     * @returns {boolean} True if successful
     */
    saveIndex(index) {
        try {
            const indexPath = path.join(__dirname, 'docs-index.json');
            fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
            console.log(`✓ Documentation index saved to: ${indexPath}`);
            return true;
        } catch (error) {
            console.error('✗ Failed to save documentation index:', error.message);
            return false;
        }
    }

    /**
     * Main update process
     * @returns {Promise<Object>} Result object with success status and index
     */
    async update() {
        console.log('🚀 DemoSDK Documentation Updater\n');
        console.log('='.repeat(60));

        // Step 1: Find SDK
        this.sdkPath = this.findSDKPath();

        if (!this.sdkPath) {
            console.error('\n❌ Cannot update documentation: DemoSDK not installed');
            console.log('\n💡 Tip: Run `npm install` first to install dependencies\n');
            return { success: false, index: null };
        }

        // Step 2: Check TypeDoc availability
        const hasTypeDoc = this.isTypeDocAvailable();

        if (!hasTypeDoc) {
            console.log('⚠️  TypeDoc not installed - will use source file parsing only');
            console.log('   To enable full TypeDoc generation, run: npm install typedoc\n');
        }

        // Step 3: Run TypeDoc if available
        let typeDocSuccess = false;

        if (hasTypeDoc) {
            typeDocSuccess = await this.runTypeDoc(this.sdkPath);
        }

        // Step 4: Parse documentation
        const index = await this.parseDocumentation(this.sdkPath, typeDocSuccess);

        // Step 5: Verify and save
        const itemCount = this.parser.getTotalCount();

        if (itemCount === 0) {
            console.error('\n❌ No documentation items found');
            console.log('    This might indicate an issue with the SDK structure\n');
            return { success: false, index: null };
        }

        console.log(`\n✓ Found ${itemCount} documentation items:`);
        console.log(`  - Classes: ${index.classes.length}`);
        console.log(`  - Interfaces: ${index.interfaces.length}`);
        console.log(`  - Functions: ${index.functions.length}`);
        console.log(`  - Enums: ${index.enums.length}`);

        // Save index to JSON
        this.saveIndex(index);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Documentation update complete!\n');

        return { success: true, index };
    }
}

// Run if called directly
if (require.main === module) {
    const updater = new DocumentationUpdater();

    updater.update()
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Error updating documentation:', error);
            process.exit(1);
        });
}

module.exports = DocumentationUpdater;
