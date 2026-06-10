const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
content = content.replace(
    '                 )})}\n              </div>\n\n             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">',
    '                 )})}\n              </div>\n             )}\n\n             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">'
);
fs.writeFileSync('src/pages/Admin.tsx', content);
