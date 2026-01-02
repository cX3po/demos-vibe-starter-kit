/**
 * Simple but effective search engine for DemoSDK documentation
 *
 * Uses simple text matching with scoring:
 * - Exact match in name: 100 points
 * - Partial match in name: 50 points
 * - Match in content: 10 points
 */

class DocumentationSearch {
    constructor(index) {
        this.index = index;
    }

    /**
     * Search across all documentation
     * @param {string} query Search query
     * @param {Object} options Search options
     * @param {string} options.type - Filter by type (class, interface, function, etc.)
     * @param {number} options.limit - Maximum results to return (default: 10)
     * @returns {Array} Array of search results with scores
     */
    search(query, options = {}) {
        const { type, limit = 10 } = options;
        const results = [];

        if (!query || typeof query !== 'string') {
            return results;
        }

        const queryLower = query.toLowerCase().trim();

        // Search in all categories
        const categories = type
            ? [type + 's'] // Add 's' to match index keys (e.g., 'class' -> 'classes')
            : ['classes', 'interfaces', 'functions', 'enums', 'types', 'variables'];

        for (const category of categories) {
            if (!this.index[category]) continue;

            for (const item of this.index[category]) {
                const score = this.scoreMatch(item, queryLower);

                if (score > 0) {
                    results.push({
                        ...item,
                        score,
                        category: category.slice(0, -1) // Remove trailing 's'
                    });
                }
            }
        }

        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);

        // Limit results
        return results.slice(0, limit);
    }

    /**
     * Score a match between an item and query
     * @param {Object} item Documentation item
     * @param {string} queryLower Lowercase query string
     * @returns {number} Score (0 = no match, higher = better match)
     */
    scoreMatch(item, queryLower) {
        let score = 0;

        const nameLower = (item.name || '').toLowerCase();
        const fullNameLower = (item.fullName || '').toLowerCase();
        const descriptionLower = (item.description || '').toLowerCase();
        const contentLower = (item.content || '').toLowerCase();

        // Exact name match (highest priority)
        if (nameLower === queryLower || fullNameLower === queryLower) {
            score += 100;
        }
        // Name starts with query
        else if (nameLower.startsWith(queryLower) || fullNameLower.startsWith(queryLower)) {
            score += 75;
        }
        // Name contains query
        else if (nameLower.includes(queryLower) || fullNameLower.includes(queryLower)) {
            score += 50;
        }

        // Description contains query
        if (descriptionLower.includes(queryLower)) {
            score += 20;
        }

        // Content contains query (lower priority)
        if (contentLower.includes(queryLower)) {
            score += 10;
        }

        // Search in methods (for classes and interfaces)
        if (item.methods && Array.isArray(item.methods)) {
            for (const method of item.methods) {
                const methodNameLower = (method.name || '').toLowerCase();

                if (methodNameLower === queryLower) {
                    score += 80;
                } else if (methodNameLower.includes(queryLower)) {
                    score += 40;
                }

                if (method.description && method.description.toLowerCase().includes(queryLower)) {
                    score += 15;
                }
            }
        }

        // Search in properties (for classes and interfaces)
        if (item.properties && Array.isArray(item.properties)) {
            for (const property of item.properties) {
                const propertyNameLower = (property.name || '').toLowerCase();

                if (propertyNameLower === queryLower) {
                    score += 70;
                } else if (propertyNameLower.includes(queryLower)) {
                    score += 35;
                }
            }
        }

        return score;
    }

    /**
     * Filter results by type
     * @param {Array} results Search results
     * @param {string} type Type to filter by
     * @returns {Array} Filtered results
     */
    filterByType(results, type) {
        if (!type) return results;
        return results.filter(result => result.type === type || result.category === type);
    }

    /**
     * Format search results for MCP response
     * @param {Array} results Search results
     * @param {number} limit Maximum results
     * @returns {Object} Formatted results with metadata
     */
    formatResults(results, limit = 10) {
        const limitedResults = results.slice(0, limit);

        return {
            query: '',
            total: results.length,
            showing: limitedResults.length,
            results: limitedResults.map(result => ({
                type: result.type || result.category,
                name: result.name,
                fullName: result.fullName,
                description: result.description,
                score: result.score,
                methods: result.methods ? result.methods.map(m => m.name) : undefined,
                properties: result.properties ? result.properties.map(p => p.name) : undefined
            }))
        };
    }

    /**
     * Get specific class documentation
     * @param {string} className Class name to find
     * @returns {Object|null} Class documentation or null
     */
    getClassDocs(className) {
        const classNameLower = className.toLowerCase();

        for (const cls of this.index.classes) {
            if (cls.name.toLowerCase() === classNameLower ||
                cls.fullName.toLowerCase() === classNameLower) {
                return cls;
            }
        }

        return null;
    }

    /**
     * Get specific method documentation
     * @param {string} className Class name
     * @param {string} methodName Method name
     * @returns {Object|null} Method documentation or null
     */
    getMethodDocs(className, methodName) {
        const cls = this.getClassDocs(className);

        if (!cls || !cls.methods) {
            return null;
        }

        const methodNameLower = methodName.toLowerCase();

        for (const method of cls.methods) {
            if (method.name.toLowerCase() === methodNameLower) {
                return {
                    class: cls.name,
                    method: method
                };
            }
        }

        return null;
    }

    /**
     * Get specific interface documentation
     * @param {string} interfaceName Interface name to find
     * @returns {Object|null} Interface documentation or null
     */
    getInterfaceDocs(interfaceName) {
        const interfaceNameLower = interfaceName.toLowerCase();

        for (const iface of this.index.interfaces) {
            if (iface.name.toLowerCase() === interfaceNameLower ||
                iface.fullName.toLowerCase() === interfaceNameLower) {
                return iface;
            }
        }

        return null;
    }

    /**
     * List all classes
     * @returns {Array} Array of class names and descriptions
     */
    listClasses() {
        return this.index.classes.map(cls => ({
            name: cls.name,
            fullName: cls.fullName,
            description: cls.description
        }));
    }

    /**
     * List all interfaces
     * @returns {Array} Array of interface names and descriptions
     */
    listInterfaces() {
        return this.index.interfaces.map(iface => ({
            name: iface.name,
            fullName: iface.fullName,
            description: iface.description
        }));
    }

    /**
     * List all functions
     * @returns {Array} Array of function names and descriptions
     */
    listFunctions() {
        return this.index.functions.map(func => ({
            name: func.name,
            fullName: func.fullName,
            description: func.description
        }));
    }

    /**
     * Get statistics about the documentation
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            classes: this.index.classes.length,
            interfaces: this.index.interfaces.length,
            functions: this.index.functions.length,
            enums: this.index.enums.length,
            types: this.index.types.length,
            variables: this.index.variables.length,
            total: this.index.classes.length +
                   this.index.interfaces.length +
                   this.index.functions.length +
                   this.index.enums.length +
                   this.index.types.length +
                   this.index.variables.length
        };
    }
}

module.exports = DocumentationSearch;
