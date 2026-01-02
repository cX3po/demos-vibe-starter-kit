const fs = require('fs');
const path = require('path');

/**
 * Documentation Parser for DemoSDK
 *
 * Parses TypeDoc HTML files or falls back to JSDoc parsing from source files.
 * Creates an in-memory searchable index of classes, interfaces, methods, and properties.
 */

class DocumentationParser {
    constructor() {
        this.index = {
            classes: [],
            interfaces: [],
            functions: [],
            enums: [],
            types: [],
            variables: []
        };
    }

    /**
     * Parse documentation from TypeDoc HTML directory
     * @param {string} dir Path to TypeDoc HTML output directory
     * @returns {Promise<Object>} Parsed documentation index
     */
    async parseTypeDocHTML(dir) {
        if (!fs.existsSync(dir)) {
            console.warn(`TypeDoc directory not found: ${dir}`);
            return this.index;
        }

        try {
            // Parse classes
            const classesDir = path.join(dir, 'classes');
            if (fs.existsSync(classesDir)) {
                const classFiles = fs.readdirSync(classesDir).filter(f => f.endsWith('.html'));
                for (const file of classFiles) {
                    const filePath = path.join(classesDir, file);
                    const classDoc = this.parseHTMLFile(filePath, 'class');
                    if (classDoc) {
                        this.index.classes.push(classDoc);
                    }
                }
            }

            // Parse interfaces
            const interfacesDir = path.join(dir, 'interfaces');
            if (fs.existsSync(interfacesDir)) {
                const interfaceFiles = fs.readdirSync(interfacesDir).filter(f => f.endsWith('.html'));
                for (const file of interfaceFiles) {
                    const filePath = path.join(interfacesDir, file);
                    const interfaceDoc = this.parseHTMLFile(filePath, 'interface');
                    if (interfaceDoc) {
                        this.index.interfaces.push(interfaceDoc);
                    }
                }
            }

            // Parse functions
            const functionsDir = path.join(dir, 'functions');
            if (fs.existsSync(functionsDir)) {
                const functionFiles = fs.readdirSync(functionsDir).filter(f => f.endsWith('.html'));
                for (const file of functionFiles) {
                    const filePath = path.join(functionsDir, file);
                    const functionDoc = this.parseHTMLFile(filePath, 'function');
                    if (functionDoc) {
                        this.index.functions.push(functionDoc);
                    }
                }
            }

            // Parse enums
            const enumsDir = path.join(dir, 'enums');
            if (fs.existsSync(enumsDir)) {
                const enumFiles = fs.readdirSync(enumsDir).filter(f => f.endsWith('.html'));
                for (const file of enumFiles) {
                    const filePath = path.join(enumsDir, file);
                    const enumDoc = this.parseHTMLFile(filePath, 'enum');
                    if (enumDoc) {
                        this.index.enums.push(enumDoc);
                    }
                }
            }

            console.log(`Parsed ${this.getTotalCount()} documentation items from TypeDoc HTML`);
            return this.index;

        } catch (error) {
            console.error('Error parsing TypeDoc HTML:', error.message);
            return this.index;
        }
    }

    /**
     * Parse a single HTML file
     * @param {string} filePath Path to HTML file
     * @param {string} type Type of documentation (class, interface, function, etc.)
     * @returns {Object|null} Parsed documentation object
     */
    parseHTMLFile(filePath, type) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath, '.html');

            // Extract name from filename (e.g., websdk.Demos.html -> Demos)
            const nameParts = fileName.split('.');
            const name = nameParts[nameParts.length - 1];

            // Extract description (simple text extraction between tags)
            const description = this.extractDescription(content);

            // Extract methods/properties if it's a class or interface
            let methods = [];
            let properties = [];

            if (type === 'class' || type === 'interface') {
                methods = this.extractMethods(content);
                properties = this.extractProperties(content);
            }

            // Extract parameters if it's a function
            let parameters = [];
            let returns = '';
            if (type === 'function') {
                parameters = this.extractParameters(content);
                returns = this.extractReturnType(content);
            }

            return {
                type,
                name,
                fullName: fileName.replace('.html', ''),
                description,
                methods,
                properties,
                parameters,
                returns,
                filePath: filePath,
                content: this.stripHTML(content).substring(0, 5000) // Keep first 5000 chars for search
            };

        } catch (error) {
            console.error(`Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Extract description from HTML content
     * @param {string} html HTML content
     * @returns {string} Extracted description
     */
    extractDescription(html) {
        // Look for common description patterns in TypeDoc HTML
        const descriptionPatterns = [
            /<div class="tsd-comment[^>]*>(.*?)<\/div>/s,
            /<section class="tsd-panel[^>]*tsd-comment[^>]*>(.*?)<\/section>/s,
            /<p>(.*?)<\/p>/
        ];

        for (const pattern of descriptionPatterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return this.stripHTML(match[1]).trim().substring(0, 500);
            }
        }

        return '';
    }

    /**
     * Extract methods from HTML content
     * @param {string} html HTML content
     * @returns {Array} Array of method objects
     */
    extractMethods(html) {
        const methods = [];

        // Look for method sections in TypeDoc HTML
        const methodPattern = /<section[^>]*class="[^"]*tsd-member[^"]*"[^>]*>(.*?)<\/section>/gs;
        const matches = html.matchAll(methodPattern);

        for (const match of matches) {
            const methodHTML = match[1];

            // Extract method name
            const nameMatch = methodHTML.match(/<h3[^>]*>(.*?)<\/h3>/s) ||
                            methodHTML.match(/id="([^"]+)"/);

            if (nameMatch) {
                const methodName = this.stripHTML(nameMatch[1]).trim();

                // Extract method signature/parameters
                const signatureMatch = methodHTML.match(/<div[^>]*class="[^"]*tsd-signature[^"]*"[^>]*>(.*?)<\/div>/s);
                const signature = signatureMatch ? this.stripHTML(signatureMatch[1]).trim() : '';

                // Extract description
                const descMatch = methodHTML.match(/<div[^>]*class="[^"]*tsd-comment[^"]*"[^>]*>(.*?)<\/div>/s);
                const description = descMatch ? this.stripHTML(descMatch[1]).trim().substring(0, 300) : '';

                if (methodName && !methodName.startsWith('tsd-')) {
                    methods.push({
                        name: methodName,
                        signature,
                        description
                    });
                }
            }
        }

        return methods;
    }

    /**
     * Extract properties from HTML content
     * @param {string} html HTML content
     * @returns {Array} Array of property objects
     */
    extractProperties(html) {
        const properties = [];

        // Look for property sections
        const propertyPattern = /<div[^>]*class="[^"]*tsd-property[^"]*"[^>]*>(.*?)<\/div>/gs;
        const matches = html.matchAll(propertyPattern);

        for (const match of matches) {
            const propertyHTML = match[1];
            const nameMatch = propertyHTML.match(/id="([^"]+)"/) ||
                            propertyHTML.match(/<h4[^>]*>(.*?)<\/h4>/s);

            if (nameMatch) {
                const propertyName = this.stripHTML(nameMatch[1]).trim();
                if (propertyName && !propertyName.startsWith('tsd-')) {
                    properties.push({
                        name: propertyName,
                        type: this.extractType(propertyHTML)
                    });
                }
            }
        }

        return properties;
    }

    /**
     * Extract parameters from function HTML
     * @param {string} html HTML content
     * @returns {Array} Array of parameter objects
     */
    extractParameters(html) {
        const parameters = [];
        const paramPattern = /<li[^>]*>(.*?)<span[^>]*>([^<]+)<\/span>[^:]*:[^<]*(.*?)<\/li>/gs;
        const matches = html.matchAll(paramPattern);

        for (const match of matches) {
            parameters.push({
                name: this.stripHTML(match[2]).trim(),
                type: this.stripHTML(match[3]).trim(),
                description: this.stripHTML(match[1]).trim()
            });
        }

        return parameters;
    }

    /**
     * Extract return type from HTML
     * @param {string} html HTML content
     * @returns {string} Return type
     */
    extractReturnType(html) {
        const returnMatch = html.match(/Returns[^:]*:[^<]*<[^>]*>([^<]+)<\//i);
        return returnMatch ? this.stripHTML(returnMatch[1]).trim() : '';
    }

    /**
     * Extract type from HTML content
     * @param {string} html HTML content
     * @returns {string} Type string
     */
    extractType(html) {
        const typeMatch = html.match(/:\s*<[^>]*>([^<]+)<\//);
        return typeMatch ? this.stripHTML(typeMatch[1]).trim() : '';
    }

    /**
     * Strip HTML tags from content
     * @param {string} html HTML content
     * @returns {string} Plain text
     */
    stripHTML(html) {
        return html
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Parse source files (fallback when TypeDoc not available)
     * @param {string} sdkPath Path to SDK source files
     * @returns {Promise<Object>} Parsed documentation index
     */
    async parseSourceFiles(sdkPath) {
        console.log('Falling back to source file parsing...');

        try {
            const packageJsonPath = path.join(sdkPath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                console.warn(`SDK package.json not found at: ${packageJsonPath}`);
                return this.index;
            }

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Try to find main entry point
            const mainFile = packageJson.main || packageJson.module || 'index.js';
            const mainPath = path.join(sdkPath, mainFile);

            if (fs.existsSync(mainPath)) {
                this.parseJavaScriptFile(mainPath);
            }

            // Also try to parse any .d.ts files
            this.parseTypeScriptDefinitions(sdkPath);

            console.log(`Parsed ${this.getTotalCount()} documentation items from source files`);
            return this.index;

        } catch (error) {
            console.error('Error parsing source files:', error.message);
            return this.index;
        }
    }

    /**
     * Parse JavaScript file for JSDoc comments
     * @param {string} filePath Path to JavaScript file
     */
    parseJavaScriptFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Extract class definitions
            const classPattern = /\/\*\*(.*?)\*\/\s*(?:export\s+)?class\s+(\w+)/gs;
            const classMatches = content.matchAll(classPattern);

            for (const match of classMatches) {
                const description = this.stripHTML(match[1]).trim();
                const className = match[2];

                this.index.classes.push({
                    type: 'class',
                    name: className,
                    fullName: className,
                    description,
                    methods: [],
                    properties: [],
                    content: description
                });
            }

            // Extract function definitions
            const functionPattern = /\/\*\*(.*?)\*\/\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/gs;
            const functionMatches = content.matchAll(functionPattern);

            for (const match of functionMatches) {
                const description = this.stripHTML(match[1]).trim();
                const functionName = match[2];

                this.index.functions.push({
                    type: 'function',
                    name: functionName,
                    fullName: functionName,
                    description,
                    parameters: [],
                    content: description
                });
            }

        } catch (error) {
            console.error(`Error parsing ${filePath}:`, error.message);
        }
    }

    /**
     * Parse TypeScript definition files
     * @param {string} sdkPath Path to SDK directory
     */
    parseTypeScriptDefinitions(sdkPath) {
        try {
            const files = this.findFiles(sdkPath, '.d.ts');

            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');

                // Extract interface definitions
                const interfacePattern = /export\s+interface\s+(\w+)\s*{([^}]*)}/gs;
                const interfaceMatches = content.matchAll(interfacePattern);

                for (const match of interfaceMatches) {
                    this.index.interfaces.push({
                        type: 'interface',
                        name: match[1],
                        fullName: match[1],
                        description: `Interface ${match[1]}`,
                        properties: [],
                        content: match[2]
                    });
                }
            }

        } catch (error) {
            console.error('Error parsing TypeScript definitions:', error.message);
        }
    }

    /**
     * Find files with specific extension
     * @param {string} dir Directory to search
     * @param {string} ext File extension
     * @returns {Array} Array of file paths
     */
    findFiles(dir, ext) {
        const files = [];

        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && entry.name !== 'node_modules') {
                    files.push(...this.findFiles(fullPath, ext));
                } else if (entry.isFile() && entry.name.endsWith(ext)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignore errors (e.g., permission denied)
        }

        return files;
    }

    /**
     * Get total count of parsed items
     * @returns {number} Total count
     */
    getTotalCount() {
        return this.index.classes.length +
               this.index.interfaces.length +
               this.index.functions.length +
               this.index.enums.length +
               this.index.types.length +
               this.index.variables.length;
    }

    /**
     * Get the parsed index
     * @returns {Object} Documentation index
     */
    getIndex() {
        return this.index;
    }
}

module.exports = DocumentationParser;
