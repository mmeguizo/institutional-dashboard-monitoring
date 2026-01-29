/**
 * Comprehensive script to fix ALL subscription memory leaks in Angular components
 * Run with: node fix-all-subscriptions.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Pattern 1: Replace all old subscription variable references with destroy$
    // Matches: this.someSubscription or this.someSub
    const oldVarPattern = /this\.(get\w*Subscription|get\w*Sub|\w+Subscription|\w+Sub)(?=\.(next|complete|unsubscribe)\(\))/g;
    newContent = newContent.replace(oldVarPattern, 'this.destroy$');

    // Pattern 2: Replace .unsubscribe() with .next() and .complete()
    newContent = newContent.replace(
        /this\.destroy\$\.unsubscribe\(\);/g,
        'this.destroy$.next();\n        this.destroy$.complete();'
    );

    // Pattern 3: Fix any duplicate next()/complete() pairs
    newContent = newContent.replace(
        /(this\.destroy\$\.next\(\);\s*this\.destroy\$\.complete\(\);)(\s*this\.destroy\$\.next\(\);\s*this\.destroy\$\.complete\(\);)+/g,
        '$1'
    );

    // Pattern 4: Replace takeUntil with old variable names
    newContent = newContent.replace(
        /takeUntil\(this\.(get\w*Subscription|get\w*Sub|\w+Subscription|\w+Sub)\)/g,
        'takeUntil(this.destroy$)'
    );

    // Pattern 5: Ensure destroy$ is declared if component has ngOnDestroy with destroy$ references
    if (newContent.includes('this.destroy$.next()') && !newContent.includes('private destroy$ = new Subject<void>()')) {
        // Check if there's an old declaration to replace
        const oldDeclPattern = /private\s+\w+(Subscription|Sub)\s*=\s*new\s+Subject<void>\(\);/;
        if (oldDeclPattern.test(newContent)) {
            newContent = newContent.replace(
                oldDeclPattern,
                '/** Subject for managing subscriptions - MUST call next() and complete() in ngOnDestroy */\n    private destroy$ = new Subject<void>();'
            );
        } else {
            // Need to add destroy$ declaration - find a good spot after the class opening
            const classMatch = newContent.match(/export class \w+ implements[^{]+\{/);
            if (classMatch) {
                const insertPos = classMatch.index + classMatch[0].length;
                const declaration = '\n    /** Subject for managing subscriptions - MUST call next() and complete() in ngOnDestroy */\n    private destroy$ = new Subject<void>();\n';
                newContent = newContent.slice(0, insertPos) + declaration + newContent.slice(insertPos);
            }
        }
    }

    // Remove any duplicate destroy$ declarations
    const destroyDeclRegex = /\/\*\* Subject for managing subscriptions.*?\*\/\s*\n\s*private destroy\$ = new Subject<void>\(\);/g;
    const matches = newContent.match(destroyDeclRegex);
    if (matches && matches.length > 1) {
        // Keep only first occurrence
        let first = true;
        newContent = newContent.replace(destroyDeclRegex, (match) => {
            if (first) {
                first = false;
                return match;
            }
            return '';
        });
    }

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

        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('projects')) {
            fixedCount += walkDir(filePath);
        } else if (file.endsWith('.component.ts')) {
            if (processFile(filePath)) {
                fixedCount++;
            }
        }
    });

    return fixedCount;
}

console.log('🔍 Scanning for ALL subscription patterns to fix...\n');
const count = walkDir(srcDir);
console.log(`\n✅ Fixed ${count} files`);
console.log('\n📝 Note: Please review the changes and test the application.');
