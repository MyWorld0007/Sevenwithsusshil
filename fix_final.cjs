const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');
lines.splice(766, 0, '             )}');
fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
