const http = require('http');

const endpoints = [
  '/api/settings',
  '/api/life_paths',
  '/api/admin/testimonials',
  '/api/pages',
  '/api/faqs',
  '/api/services'
];

endpoints.forEach(ep => {
    http.get('http://localhost:3000' + ep, (res) => {
        let d = '';
        res.on('data', (chunk) => d += chunk);
        res.on('end', () => console.log(ep, '=> Status:', res.statusCode, 'Body:', d.substring(0, 100)));
    });
});
