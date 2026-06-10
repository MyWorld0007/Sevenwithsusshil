const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// The issue is that we have:
// {testimonials.length === 0 ? (
//    <div ...>No stories found.</div>
// ) : (
//    <div ...>
//       {testimonials.map(t => { return ( <div/> )})}
//    </div>
// 
// <div className="bg-bg-card...">

// We are missing the `)}` to close the `testimonials.length === 0 ? () : ()` block!

content = content.replace(
    /                 \)}\)}\n              <\/div>\n\n             <div className="bg-bg-card border border-gold\/20 p-8 shadow-sm">/g,
    `                 )})}\n              </div>\n             )}\n\n             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">`
);

fs.writeFileSync('src/pages/Admin.tsx', content);
