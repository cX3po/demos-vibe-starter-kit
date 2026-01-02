#!/usr/bin/env node

/**
 * DemoSDK API Reference MCP Server
 *
 * This MCP server provides tools for searching and accessing DemoSDK documentation
 * through the Model Context Protocol, allowing AI assistants to help users with the SDK.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs');
const path = require('path');
const DocumentationParser = require('./docs/parser');
const DocumentationSearch = require('./docs/search');

// Initialize documentation index
let docsIndex = null;
let searchEngine = null;
let initialized = false;

/**
 * Initialize documentation from cached index or parse fresh
 */
async function initializeDocumentation() {
    if (initialized) return true;

    try {
        const indexPath = path.join(__dirname, 'docs', 'docs-index.json');

        // Try to load cached index
        if (fs.existsSync(indexPath)) {
            console.error('Loading cached documentation index...');
            docsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
            searchEngine = new DocumentationSearch(docsIndex);
            initialized = true;
            console.error(`✓ Loaded ${getTotalCount()} documentation items`);
            return true;
        }

        // If no cache, try to parse from TypeDoc HTML
        const typeDocPath = path.join(__dirname, 'docs', 'demosdk-api-ref');
        if (fs.existsSync(typeDocPath)) {
            console.error('Parsing TypeDoc documentation...');
            const parser = new DocumentationParser();
            docsIndex = await parser.parseTypeDocHTML(typeDocPath);
            searchEngine = new DocumentationSearch(docsIndex);
            initialized = true;
            console.error(`✓ Parsed ${getTotalCount()} documentation items`);
            return true;
        }

        // Last resort: parse from SDK source files
        const sdkPath = path.resolve(__dirname, '../node_modules/@kynesyslabs/demosdk');
        if (fs.existsSync(sdkPath)) {
            console.error('Parsing SDK source files...');
            const parser = new DocumentationParser();
            docsIndex = await parser.parseSourceFiles(sdkPath);
            searchEngine = new DocumentationSearch(docsIndex);
            initialized = true;
            console.error(`✓ Parsed ${getTotalCount()} documentation items from source`);
            return true;
        }

        console.error('⚠️  No documentation found - run `npm run update-docs` first');
        docsIndex = { classes: [], interfaces: [], functions: [], enums: [], types: [], variables: [] };
        searchEngine = new DocumentationSearch(docsIndex);
        initialized = true;
        return false;

    } catch (error) {
        console.error('Error initializing documentation:', error.message);
        docsIndex = { classes: [], interfaces: [], functions: [], enums: [], types: [], variables: [] };
        searchEngine = new DocumentationSearch(docsIndex);
        initialized = true;
        return false;
    }
}

/**
 * Get total count of documentation items
 * @returns {number} Total count
 */
function getTotalCount() {
    if (!docsIndex) return 0;
    return (docsIndex.classes?.length || 0) +
           (docsIndex.interfaces?.length || 0) +
           (docsIndex.functions?.length || 0) +
           (docsIndex.enums?.length || 0) +
           (docsIndex.types?.length || 0) +
           (docsIndex.variables?.length || 0);
}

// Initialize MCP Server
const server = new Server(
    {
        name: 'demosdk-docs',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Handle tool calls
 */
server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;

    // Ensure documentation is initialized
    await initializeDocumentation();

    try {
        switch (name) {
            case 'search_demosdk_docs':
                return await searchDocs(args);

            case 'get_class_docs':
                return await getClassDocs(args);

            case 'get_method_docs':
                return await getMethodDocs(args);

            case 'list_classes':
                return await listClasses();

            case 'list_interfaces':
                return await listInterfaces();

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * List available tools
 */
server.setRequestHandler('tools/list', async () => {
    return {
        tools: [
            {
                name: 'search_demosdk_docs',
                description: 'Search the DemoSDK documentation for classes, methods, interfaces, and more',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (e.g., "Demos", "connect", "transaction")',
                        },
                        type: {
                            type: 'string',
                            description: 'Filter by type: class, interface, function, enum',
                            enum: ['class', 'interface', 'function', 'enum'],
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results (default: 10, max: 50)',
                            default: 10,
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'get_class_docs',
                description: 'Get detailed documentation for a specific class',
                inputSchema: {
                    type: 'object',
                    properties: {
                        className: {
                            type: 'string',
                            description: 'Name of the class (e.g., "Demos", "DemosWebAuth")',
                        },
                    },
                    required: ['className'],
                },
            },
            {
                name: 'get_method_docs',
                description: 'Get detailed documentation for a specific method of a class',
                inputSchema: {
                    type: 'object',
                    properties: {
                        className: {
                            type: 'string',
                            description: 'Name of the class',
                        },
                        methodName: {
                            type: 'string',
                            description: 'Name of the method',
                        },
                    },
                    required: ['className', 'methodName'],
                },
            },
            {
                name: 'list_classes',
                description: 'List all available classes in the DemoSDK',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'list_interfaces',
                description: 'List all available interfaces in the DemoSDK',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ],
    };
});

// Tool Implementation Functions

async function searchDocs(args) {
    const { query, type, limit = 10 } = args;

    if (!query) {
        throw new Error('Query parameter is required');
    }

    const maxLimit = Math.min(limit, 50);
    const results = searchEngine.search(query, { type, limit: maxLimit });

    if (results.length === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: `No results found for "${query}".\n\nTry:\n- Searching for a class name (e.g., "Demos")\n- Searching for a method (e.g., "connect")\n- Using broader terms\n\nRun \`list_classes\` to see all available classes.`,
                },
            ],
        };
    }

    // Format results
    let responseText = `# Search Results for "${query}"\n\n`;
    responseText += `Found ${results.length} result(s):\n\n`;

    for (const result of results) {
        responseText += `## ${result.name} (${result.type || result.category})\n`;

        if (result.description) {
            responseText += `${result.description}\n\n`;
        }

        if (result.methods && result.methods.length > 0) {
            responseText += `**Methods:** ${result.methods.slice(0, 5).map(m => m.name).join(', ')}`;
            if (result.methods.length > 5) {
                responseText += ` (and ${result.methods.length - 5} more)`;
            }
            responseText += '\n\n';
        }

        if (result.properties && result.properties.length > 0) {
            responseText += `**Properties:** ${result.properties.slice(0, 5).map(p => p.name).join(', ')}`;
            if (result.properties.length > 5) {
                responseText += ` (and ${result.properties.length - 5} more)`;
            }
            responseText += '\n\n';
        }

        responseText += `*Relevance Score: ${result.score}*\n\n`;
        responseText += '---\n\n';
    }

    responseText += `\nℹ️ Use \`get_class_docs\` with a class name to see full documentation.`;

    return {
        content: [
            {
                type: 'text',
                text: responseText,
            },
        ],
    };
}

async function getClassDocs(args) {
    const { className } = args;

    if (!className) {
        throw new Error('className parameter is required');
    }

    const classDoc = searchEngine.getClassDocs(className);

    if (!classDoc) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Class "${className}" not found.\n\nRun \`list_classes\` to see all available classes.`,
                },
            ],
        };
    }

    let responseText = `# ${classDoc.name}\n\n`;

    if (classDoc.description) {
        responseText += `${classDoc.description}\n\n`;
    }

    if (classDoc.methods && classDoc.methods.length > 0) {
        responseText += `## Methods\n\n`;
        for (const method of classDoc.methods) {
            responseText += `### ${method.name}\n`;

            if (method.signature) {
                responseText += `\`\`\`typescript\n${method.signature}\n\`\`\`\n\n`;
            }

            if (method.description) {
                responseText += `${method.description}\n\n`;
            }

            responseText += '---\n\n';
        }
    }

    if (classDoc.properties && classDoc.properties.length > 0) {
        responseText += `## Properties\n\n`;
        for (const property of classDoc.properties) {
            responseText += `- **${property.name}**`;
            if (property.type) {
                responseText += `: \`${property.type}\``;
            }
            responseText += '\n';
        }
        responseText += '\n';
    }

    return {
        content: [
            {
                type: 'text',
                text: responseText,
            },
        ],
    };
}

async function getMethodDocs(args) {
    const { className, methodName } = args;

    if (!className || !methodName) {
        throw new Error('className and methodName parameters are required');
    }

    const methodDoc = searchEngine.getMethodDocs(className, methodName);

    if (!methodDoc) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Method "${methodName}" not found in class "${className}".\n\nUse \`get_class_docs\` to see all methods of the class.`,
                },
            ],
        };
    }

    let responseText = `# ${methodDoc.class}.${methodDoc.method.name}\n\n`;

    if (methodDoc.method.signature) {
        responseText += `## Signature\n\n\`\`\`typescript\n${methodDoc.method.signature}\n\`\`\`\n\n`;
    }

    if (methodDoc.method.description) {
        responseText += `## Description\n\n${methodDoc.method.description}\n\n`;
    }

    return {
        content: [
            {
                type: 'text',
                text: responseText,
            },
        ],
    };
}

async function listClasses() {
    const classes = searchEngine.listClasses();

    if (classes.length === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'No classes found. Run `npm run update-docs` to generate documentation.',
                },
            ],
        };
    }

    let responseText = `# DemoSDK Classes (${classes.length})\n\n`;

    for (const cls of classes) {
        responseText += `## ${cls.name}\n`;
        if (cls.description) {
            responseText += `${cls.description}\n`;
        }
        responseText += '\n';
    }

    responseText += `\nℹ️ Use \`get_class_docs\` with a class name to see full documentation.`;

    return {
        content: [
            {
                type: 'text',
                text: responseText,
            },
        ],
    };
}

async function listInterfaces() {
    const interfaces = searchEngine.listInterfaces();

    if (interfaces.length === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'No interfaces found. Run `npm run update-docs` to generate documentation.',
                },
            ],
        };
    }

    let responseText = `# DemoSDK Interfaces (${interfaces.length})\n\n`;

    for (const iface of interfaces) {
        responseText += `## ${iface.name}\n`;
        if (iface.description) {
            responseText += `${iface.description}\n`;
        }
        responseText += '\n';
    }

    return {
        content: [
            {
                type: 'text',
                text: responseText,
            },
        ],
    };
}

// Start the server
async function main() {
    // Pre-initialize documentation
    await initializeDocumentation();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('DemoSDK API Reference MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
