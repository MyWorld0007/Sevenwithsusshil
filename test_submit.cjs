const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user-testimonials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Submit Response:', data));
});

req.write(JSON.stringify({ 
    text: 'Test Review', 
    initial: 'T', 
    name: 'Test Name', 
    loc: 'Test Loc', 
    rating: 5 
}));
req.end();
