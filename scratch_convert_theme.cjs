const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /(?<!dark:)(?<!light:)bg-zinc-950(?!\/)/g, replacement: 'bg-zinc-50 dark:bg-zinc-950' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-900(?!\/)/g, replacement: 'bg-white dark:bg-zinc-900' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-800(?!\/)/g, replacement: 'bg-zinc-100 dark:bg-zinc-800' },
    { regex: /(?<!dark:)(?<!light:)(?<!-)text-white/g, replacement: 'text-zinc-900 dark:text-white' },
    { regex: /(?<!dark:)(?<!light:)text-zinc-400/g, replacement: 'text-zinc-600 dark:text-zinc-400' },
    { regex: /(?<!dark:)(?<!light:)text-zinc-300/g, replacement: 'text-zinc-700 dark:text-zinc-300' },
    { regex: /(?<!dark:)(?<!light:)text-zinc-500/g, replacement: 'text-zinc-500 dark:text-zinc-400' },
    { regex: /(?<!dark:)(?<!light:)border-white\/5/g, replacement: 'border-zinc-200 dark:border-white/5' },
    { regex: /(?<!dark:)(?<!light:)border-white\/10/g, replacement: 'border-zinc-300 dark:border-white/10' },
    { regex: /(?<!dark:)(?<!light:)(?<!hover:)bg-white\/5/g, replacement: 'bg-zinc-100 dark:bg-white/5' },
    { regex: /(?<!dark:)(?<!light:)hover:bg-white\/5/g, replacement: 'hover:bg-zinc-100 dark:hover:bg-white/5' },
    { regex: /(?<!dark:)(?<!light:)hover:text-white/g, replacement: 'hover:text-zinc-900 dark:hover:text-white' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-950\/90/g, replacement: 'bg-white/90 dark:bg-zinc-950/90' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-950\/80/g, replacement: 'bg-white/80 dark:bg-zinc-950/80' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-900\/80/g, replacement: 'bg-white/80 dark:bg-zinc-900/80' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-900\/50/g, replacement: 'bg-white/50 dark:bg-zinc-900/50' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-900\/40/g, replacement: 'bg-white/40 dark:bg-zinc-900/40' },
    { regex: /(?<!dark:)(?<!light:)bg-zinc-900\/30/g, replacement: 'bg-white/80 dark:bg-zinc-900/30' },
    { regex: /(?<!dark:)(?<!light:)shadow-white\/5/g, replacement: 'shadow-zinc-200 dark:shadow-white/5' },
    { regex: /(?<!dark:)(?<!light:)divide-white\/5/g, replacement: 'divide-zinc-200 dark:divide-white/5' }
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function processDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Conversion complete!');
