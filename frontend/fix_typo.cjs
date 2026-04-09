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
  content = content.replace(/surface00/g, 'surface')
                   .replace(/border-subtle00/g, 'border-subtle');
  fs.writeFileSync(file, content);
});
console.log('Fixed CSS typos!');
