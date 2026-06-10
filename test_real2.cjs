const http = require('https');

const options = {
  hostname: 'sevenastro.com',
  path: '/api.php?route=testimonials',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
     console.log("SEVENASTRO.COM GET testimonials:", res.statusCode, data);
  });
});

req.end();
