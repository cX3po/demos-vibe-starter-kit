/**
 * Common helper functions for Demos Vibe Starter Kit examples
 */

function displayHeader(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${title}`);
    console.log('='.repeat(60) + '\n');
}

function displaySuccess(message) {
    console.log(`\n✅ ${message}\n`);
}

function displayError(message) {
    console.error(`\n❌ ${message}\n`);
}

function displayInfo(message) {
    console.log(`ℹ️  ${message}`);
}

function displayWarning(message) {
    console.warn(`⚠️  ${message}`);
}

function displayStep(step, total, message) {
    console.log(`\n[${step}/${total}] ${message}...`);
}

function displayTransaction(label, hash, explorerUrl) {
    console.log(`\n${label}:`);
    console.log(`  Hash: ${hash}`);
    if (explorerUrl) {
        console.log(`  Explorer: ${explorerUrl}`);
    }
}

function displaySeparator() {
    console.log('\n' + '-'.repeat(60) + '\n');
}

function formatAddress(address, startChars = 6, endChars = 4) {
    if (!address || address.length < startChars + endChars) {
        return address;
    }
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            displayWarning(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            await sleep(delay);
            delay *= 2; // Exponential backoff
        }
    }
}

function validateEnvVar(varName, required = true) {
    const value = process.env[varName];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
    return value;
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function displayCompletion(startTime) {
    const duration = Date.now() - startTime;
    displaySeparator();
    displaySuccess(`Completed in ${formatDuration(duration)}`);
    console.log('');
}

module.exports = {
    displayHeader,
    displaySuccess,
    displayError,
    displayInfo,
    displayWarning,
    displayStep,
    displayTransaction,
    displaySeparator,
    formatAddress,
    sleep,
    withRetry,
    validateEnvVar,
    formatDuration,
    displayCompletion
};
