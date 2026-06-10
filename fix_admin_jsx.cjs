const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
content = content.replace(
`                           </div>
                        </div>
                     </div>
                 )})}
              </div>

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">`,
`                           </div>
                        </div>
                     </div>
                 )})}
              </div>
             )}

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">`
);
fs.writeFileSync('src/pages/Admin.tsx', content);
