/**
 * Script to fix subscription memory leaks in Angular components
 * Run with: node fix-subscriptions.js
 *
 * This script:
 * 1. Finds components using the old .unsubscribe() pattern
 * 2. Replaces with proper destroy$ subject pattern
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Find all subscription variable names
    const subscriptionVarRegex = /private\s+(\w+(?:Subscription|Sub))\s*=\s*new\s+Subject<void>\(\);/g;
    const subscriptionVars = [];
    let match;

    while ((match = subscriptionVarRegex.exec(content)) !== null) {
        subscriptionVars.push(match[1]);
    }

    if (subscriptionVars.length === 0) {
        return false;
    }

    // Replace each subscription variable and its references
    subscriptionVars.forEach((varName, index) => {
        // Only keep destroy$ for the first one, remove declarations for others
        if (index === 0) {
            // Replace declaration
            const declRegex = new RegExp(
                `private\\s+${varName}\\s*=\\s*new\\s+Subject<void>\\(\\);`,
                'g'
            );
            newContent = newContent.replace(
                declRegex,
                '/** Subject for managing subscriptions - MUST call next() and complete() in ngOnDestroy */\n    private destroy$ = new Subject<void>();'
            );
        } else {
            // Remove duplicate declarations
            const declRegex = new RegExp(
                `(\\s*\\/\\*\\*[^*]*\\*\\/)?\\s*private\\s+${varName}\\s*=\\s*new\\s+Subject<void>\\(\\);`,
                'g'
            );
            newContent = newContent.replace(declRegex, '');
        }

        // Replace all references: this.varName -> this.destroy$
        const refRegex = new RegExp(`this\\.${varName}`, 'g');
        newContent = newContent.replace(refRegex, 'this.destroy$');
    });

    // Fix any .unsubscribe() calls to .next() and .complete()
    // Look for patterns like: this.destroy$.unsubscribe();
    newContent = newContent.replace(
        /this\.destroy\$\.unsubscribe\(\);/g,
        'this.destroy$.next();\n        this.destroy$.complete();'
    );

    // Remove duplicate destroy$ calls in ngOnDestroy
    // Pattern: multiple next()/complete() pairs
    newContent = newContent.replace(
        /(this\.destroy\$\.next\(\);\s*this\.destroy\$\.complete\(\);)(\s*this\.destroy\$\.next\(\);\s*this\.destroy\$\.complete\(\);)+/g,
        '$1'
    );

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    let fixedCount = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.includes('node_modules')) {
            fixedCount += walkDir(filePath);
        } else if (file.endsWith('.component.ts')) {
            if (processFile(filePath)) {
                fixedCount++;
            }
        }
    });

    return fixedCount;
}

console.log('🔍 Scanning for subscription patterns to fix...\n');
const count = walkDir(srcDir);
console.log(`\n✅ Fixed ${count} files`);
console.log('\n📝 Note: Please review the changes and test the application.');
