const fs = require('fs');
const path = require('path');

function walk(dir, call) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, call);
    else call(full);
  });
}

walk('./src', file => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-dark-900/g, 'bg-background')
                   .replace(/bg-dark-[8]/g, 'bg-surface')
                   .replace(/bg-dark-[67]/g, 'bg-surface-hover')
                   .replace(/border-dark-[6789]/g, 'border-border-subtle')
                   .replace(/text-white/g, 'text-text-main')
                   .replace(/text-gray-[2345]00/g, 'text-text-muted')
                   // Now specifically restore text-white ONLY for primary/accent buttons
                   .replace(/bg-primary([^"']*)text-text-main/g, 'bg-primary$1text-white')
                   .replace(/bg-accent([^"']*)text-text-main/g, 'bg-accent$1text-white')
                   .replace(/from-primary([^"']*)text-text-main/g, 'from-primary$1text-white')
                   .replace(/from-accent([^"']*)text-text-main/g, 'from-accent$1text-white')
                   .replace(/bg-red-[56]00([^"']*)text-text-main/g, 'bg-red-500$1text-white')
                   .replace(/bg-green-[56]00([^"']*)text-text-main/g, 'bg-green-500$1text-white')
                   .replace(/text-text-main([^"']*)bg-primary/g, 'text-white$1bg-primary')
                   .replace(/text-text-main([^"']*)bg-accent/g, 'text-white$1bg-accent')
                   .replace(/bg-gray-[56]00([^"']*)text-text-main/g, 'bg-gray-500$1text-white')
                   .replace(/bg-gray-[56]00([^"']*)text-text-muted/g, 'bg-gray-500$1text-white');
  fs.writeFileSync(file, content);
});
console.log('UI files refactored to theme variables!');
