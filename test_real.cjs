const http = require('https');

const options = {
  hostname: 'sevenastro.com',
  path: '/api.php?route=admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    let token = '';
    try { token = JSON.parse(data).token; } catch(e) {}
    
    // Call api.php directly to simulate hostinger deployment
    const ep = '/api.php?route=admin/testimonials';
    const opts = { headers: { 'Authorization': 'Bearer ' + token } };
    http.get('https://sevenastro.com' + ep, opts, (r) => {
        let d = '';
        r.on('data', (chunk) => d += chunk);
        r.on('end', () => {
           console.log("SEVENASTRO.COM GET admin/testimonials:", r.statusCode, d);
        });
      });
  });
});

req.write(JSON.stringify({ email: 'masteradmin@sevenastro.com', password: '@Masteradmin_2026' }));
req.end();
