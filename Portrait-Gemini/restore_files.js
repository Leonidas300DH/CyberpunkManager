const fs = require('fs');
const path = require('path');

const srcDir = '/Users/danielherbera/.gemini/antigravity/brain/af20f1dd-1a08-4dc8-a6b0-8fecb6da0da4';
const destDirTemp = '/Users/danielherbera/Dropbox/Antigravity/Cyberpunk Combat Zone/combat-zone-companion/Portrait-Gemini/Edgerunners';

const files = fs.readdirSync(srcDir);
let restoredCount = 0;

files.forEach(file => {
    if (file.startsWith('er_resuscitated_') && file.endsWith('.png')) {
        const originalName = file.replace('er_resuscitated_', '');
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDirTemp, originalName);

        try {
            fs.copyFileSync(srcPath, destPath);
            fs.unlinkSync(srcPath);
            restoredCount++;
            console.log(`Restored: ${originalName}`);
        } catch (e) {
            console.error(`Error restoring ${originalName}:`, e);
        }
    }
});

console.log(`Successfully restored ${restoredCount} files to Edgerunners.`);
