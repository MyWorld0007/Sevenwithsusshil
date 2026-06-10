const http = require('https');

const options = {
  hostname: 'ais-dev-srkum5vc3mspesw3nyu7zi-840251302482.asia-southeast1.run.app',
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
    console.log("Login Res:", data);
    let token = '';
    try { token = JSON.parse(data).token; } catch(e) {}
    
    // Call api.php directly to simulate hostinger deployment
    const ep = '/api.php?route=admin/testimonials';
    const opts = { headers: { 'Authorization': 'Bearer ' + token } };
    http.get('https://ais-dev-srkum5vc3mspesw3nyu7zi-840251302482.asia-southeast1.run.app' + ep, opts, (r) => {
        let d = '';
        r.on('data', (chunk) => d += chunk);
        r.on('end', () => {
           console.log("API.PHP GET admin/testimonials:", r.statusCode, d);
        });
      });
  });
});

req.write(JSON.stringify({ email: 'masteradmin@sevenastro.com', password: '@Masteradmin_2026' }));
req.end();
