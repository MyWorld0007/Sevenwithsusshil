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
    console.log('Login Response:', data);
    const token = JSON.parse(data).token;
    
    http.get('http://localhost:3000/api/admin/testimonials', { headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
        let d = '';
        res.on('data', (chunk) => d += chunk);
        res.on('end', () => console.log('Admin Testimonials HTTP Status:', res.statusCode, 'Body:', d));
    });
  });
});

req.write(JSON.stringify({ email: 'masteradmin@sevenastro.com', password: '@Masteradmin_2026' }));
req.end();
