const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    
    // Call ALL endpoints just like Promise.all in Admin.tsx
    const endpoints = [
      ['/api/settings', {}],
      ['/api/life_paths', {}],
      ['/api/admin/testimonials', { headers: { 'Authorization': 'Bearer ' + token } }],
      ['/api/pages', {}],
      ['/api/faqs', {}],
      ['/api/services', {}]
    ];

    endpoints.forEach(([ep, opts]) => {
      http.get('http://localhost:3000' + ep, opts, (r) => {
        let d = '';
        r.on('data', (chunk) => d += chunk);
        r.on('end', () => {
           console.log(ep, r.statusCode, d.substring(0, 100));
        });
      });
    });
  });
});

req.write(JSON.stringify({ email: 'masteradmin@sevenastro.com', password: '@Masteradmin_2026' }));
req.end();
